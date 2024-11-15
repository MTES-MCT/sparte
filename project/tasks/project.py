import io
import logging
from datetime import timedelta
from typing import Any, Dict, Literal

import contextily as cx
import geopandas
import matplotlib.pyplot as plt
import shapely
from celery import shared_task
from django.conf import settings
from django.db import transaction
from django.db.models import F, Q
from django.urls import reverse
from django.utils import timezone
from django_app_parameter import app_parameter
from matplotlib.lines import Line2D
from matplotlib_scalebar.scalebar import ScaleBar

from project.models import Emprise, Project, Request, RequestedDocumentChoices
from public_data.domain.containers import PublicDataContainer
from public_data.models import AdminRef, ArtificialArea, Land, OcsgeDiff
from public_data.models.gpu import ArtifAreaZoneUrba, ZoneUrba
from utils.db import fix_poly
from utils.emails import SibTemplateEmail
from utils.functions import get_url_with_domain
from utils.mattermost import BlockedDiagnostic

logger = logging.getLogger(__name__)


def race_protection_save(project_id: int, fields: Dict[str, Any]) -> None:
    with transaction.atomic():
        fields_name = list(fields.keys())
        diagnostic = Project.objects.select_for_update().only(*fields_name).get(pk=project_id)
        for name, value in fields.items():
            setattr(diagnostic, name, value)
        diagnostic.save_without_historical_record(update_fields=fields_name)


def race_protection_save_map(
    project_id: int,
    field_flag_name: str,
    field_img_name: str,
    img_name: str,
    img_data: io.BytesIO,
) -> None:
    with transaction.atomic():
        diagnostic = Project.objects.select_for_update().only(field_img_name, field_flag_name).get(pk=project_id)
        field_img = getattr(diagnostic, field_img_name)
        field_img.delete(save=False)
        field_img.save(img_name, img_data, save=False)
        setattr(diagnostic, field_flag_name, True)
        diagnostic.save_without_historical_record(update_fields=[field_img_name, field_flag_name])


@shared_task(bind=True, max_retries=5)
def add_city(self, project_id: int, public_keys: str) -> list[str]:
    """Add cities to project."""
    logger.info("Start add_city project_id==%d", project_id)
    logger.info("public_keys=%s", public_keys)
    try:
        project = Project.objects.get(pk=project_id)
        lands = Land.get_lands(public_keys.split("-"))
        for land in lands:
            project.cities.add(*land.get_cities())
        race_protection_save(project_id, {"async_add_city_done": True})
    except Project.DoesNotExist:
        logger.error(f"project_id={project_id} does not exist")
    except Exception as exc:
        logger.error(exc)
        logger.exception(exc)
        self.retry(exc=exc, countdown=60)
    finally:
        logger.info("End add_city project_id=%d", project_id)

    return [city.insee for city in project.cities.all()]


@shared_task(bind=True, max_retries=5)
def set_combined_emprise(self, project_id: int) -> list[int]:
    """Use linked cities to create project emprise."""
    logger.info("Start set_combined_emprise project_id==%d", project_id)

    emprises = []

    try:
        project = Project.objects.get(pk=project_id)

        for city in project.cities.all():
            emprises.append(
                Emprise.objects.create(
                    mpoly=fix_poly(city.mpoly),
                    srid_source=city.srid_source,
                    project=project,
                )
            )

        race_protection_save(project_id, {"async_set_combined_emprise_done": True})
    except Project.DoesNotExist:
        logger.error(f"project_id={project_id} does not exist")
    except Exception as exc:
        logger.error(exc)
        logger.exception(exc)
        self.retry(exc=exc, countdown=60)
    finally:
        logger.info("End set_combined_emprise project_id=%d", project_id)

    return [emprise.id for emprise in emprises]


@shared_task(bind=True, max_retries=5)
def find_first_and_last_ocsge(self, project_id: int) -> dict[str, Any] | dict[str, None]:
    """Use associated cities to find departements and available OCSGE millesime"""
    logger.info("Start find_first_and_last_ocsge id=%d", project_id)
    try:
        project = Project.objects.get(pk=project_id)
        result = project.get_first_last_millesime()
        race_protection_save(
            project_id,
            {
                "first_year_ocsge": result["first"],
                "last_year_ocsge": result["last"],
                "available_millesimes": project.available_millesimes,
                "async_find_first_and_last_ocsge_done": True,
            },
        )
    except Project.DoesNotExist:
        logger.error(f"project_id={project_id} does not exist")
    except Exception as exc:
        logger.error(exc)
        logger.exception(exc)
        self.retry(exc=exc, countdown=300)
    finally:
        logger.info("End find_first_and_last_ocsge, project_id=%d", project_id)

    return result


@shared_task(bind=True, max_retries=5)
def calculate_project_ocsge_status(self, project_id: int) -> str:
    try:
        project = Project.objects.get(pk=project_id)
        status = project.get_ocsge_coverage_status()
        race_protection_save(
            project_id,
            {"ocsge_coverage_status": status, "async_ocsge_coverage_status_done": True},
        )
    except Project.DoesNotExist:
        logger.error(f"project_id={project_id} does not exist")
    except Exception as e:
        logger.error(e)
        logger.exception(e)
        self.retry(exc=e, countdown=300)
    finally:
        logger.info("End calculate_project_ocsge_status, project_id=%d", project_id)

    return status


@shared_task
def send_email_request_bilan(request_id) -> None:
    """Alerte envoyée à l'équipe pour les avertir d'une demande de Diagnostic."""
    logger.info("Start send_email_request_bilan, request_id=%s", request_id)
    if app_parameter.ALERTE_ON_DIAG_DL is False:
        logger.info("ALERTE_ON_DIAG_DL is False, skip send_email_request_bilan")
        return
    request = Request.objects.get(pk=request_id)
    diagnostic = request.project
    project_url = get_url_with_domain(reverse("project:home", args=[diagnostic.id]))
    relative_url = get_url_with_domain(reverse("admin:project_request_change", kwargs={"object_id": request.id}))
    image_url = "https://creative-assets.mailinblue.com/editor/image_placeholder.png"
    if diagnostic.cover_image:
        image_url = diagnostic.cover_image.url
    email = SibTemplateEmail(
        template_id=1,
        recipients=[{"name": "Team Mon Diagnostic Artificialisation", "email": app_parameter.TEAM_EMAIL}],
        params={
            "diagnostic_name": diagnostic.name,
            "user_email": request.email,
            "user_organism": request.organism,
            "user_function": request.function,
            "admin_request": relative_url,
            "image_url": image_url,
            "project_url": project_url,
        },
    )
    logger.info("result=%s", email.send())
    logger.info("End send_email_request_bilan, request_id=%s", request_id)


@shared_task(bind=True, max_retries=5)
def add_comparison_lands(self, project_id) -> list[str]:
    logger.info("Start add_comparison_lands, project_id=%d", project_id)
    try:
        project = Project.objects.get(pk=project_id)
        qs = project.get_comparison_lands()
        logger.info("Fetched %d neighboors", qs.count())
        public_keys = [_.public_key for _ in qs]
        logger.info("Neighboors: %s", ", ".join([_.name for _ in qs]))
        project.add_look_a_like(public_keys, many=True)
        logger.info("Listed neighboors : %s", project.look_a_like)

        race_protection_save(
            project_id,
            {
                "look_a_like": project.look_a_like,
                "async_add_comparison_lands_done": True,
            },
        )
    except Project.DoesNotExist:
        logger.error(f"project_id={project_id} does not exist")
    except Exception as exc:
        logger.error(exc)
        logger.exception(exc)
        self.retry(exc=exc, countdown=10)
    finally:
        logger.info("End add_comparison_lands, project_id=%d", project_id)

    return [_land.official_id for _land in qs]


@shared_task(bind=True, max_retries=5)
def generate_cover_image(self, project_id) -> None:
    logger.info("Start generate_cover_image, project_id=%d", project_id)
    try:
        diagnostic = Project.objects.get(id=int(project_id))
        geom = diagnostic.combined_emprise
        polygons = shapely.wkt.loads(geom.wkt)

        gdf_emprise = geopandas.GeoDataFrame(
            {
                "col1": [
                    "emprise diagnostic",
                ],
                "geometry": [
                    polygons,
                ],
            },
            crs=f"EPSG:{geom.srid}",
        ).to_crs(epsg=3857)

        fig, ax = plt.subplots(figsize=(60, 10))
        plt.axis("off")
        fig.set_dpi(72)

        gdf_emprise.buffer(250000).plot(ax=ax, facecolor="none", edgecolor="none")
        gdf_emprise.plot(ax=ax, facecolor="none", edgecolor="black")
        cx.add_basemap(ax, source=settings.OPENSTREETMAP_URL)

        img_data = io.BytesIO()
        plt.savefig(
            img_data,
            bbox_inches="tight",
            format="jpg",
        )
        img_data.seek(0)
        plt.close()

        race_protection_save_map(
            diagnostic.pk,
            "async_cover_image_done",
            "cover_image",
            f"cover_{project_id}.jpg",
            img_data,
        )

    except Project.DoesNotExist as exc:
        logger.error(f"project_id={project_id} does not exist")
        self.retry(exc=exc, countdown=300)
    except Exception as exc:
        logger.error(exc)
        logger.exception(exc)
        self.retry(exc=exc, countdown=300)
    finally:
        logger.info("End generate_cover_image, project_id=%d", project_id)


class WaitAsyncTaskException(Exception):
    pass


class WordAlreadySentException(Exception):
    pass


@shared_task(bind=True, max_retries=10, queue="long")
def generate_word_diagnostic_rnu_package_one_off(self, project_id) -> int:
    from diagnostic_word.renderers import (
        ConsoReportRenderer,
        FullReportRenderer,
        LocalReportRenderer,
    )

    project = Project.objects.get(id=int(project_id))
    request = Request.objects.filter(project=project).first()
    request_id = request.id

    logger.info(f"Start generate word for request_id={request_id}")
    try:
        req = Request.objects.select_related("project").get(id=int(request_id))

        if not req.project:
            raise Project.DoesNotExist("Project does not exist")
        elif not req.project.async_complete:
            msg = "Not all async tasks are completed, retry later"
            raise WaitAsyncTaskException(msg)
        elif req.sent_file:
            raise WordAlreadySentException("Word already sent")

        logger.info("Start generating word")

        logger.info("Requested document: %s", req.requested_document)

        renderer_class = {
            RequestedDocumentChoices.RAPPORT_COMPLET: FullReportRenderer,
            RequestedDocumentChoices.RAPPORT_LOCAL: LocalReportRenderer,
            RequestedDocumentChoices.RAPPORT_CONSO: ConsoReportRenderer,
        }[req.requested_document]

        with renderer_class(request=req) as renderer:
            context = renderer.get_context_data()
            buffer = renderer.render_to_docx(context=context)
            filename = renderer.get_file_name()
            req.sent_file.save(filename, buffer, save=True)
            req.done = True
            req.save(update_fields=["done"])
            logger.info("Word created and saved")
            return request_id

    except Exception as exc:
        req.record_exception(exc)
        logger.error("Error while generating word: %s", exc)
        logger.exception(exc)
        self.retry(exc=exc, countdown=10)


@shared_task(bind=True, max_retries=6, queue="long")
def generate_word_diagnostic(self, request_id) -> int:
    from diagnostic_word.renderers import (
        ConsoReportRenderer,
        FullReportRenderer,
        LocalReportRenderer,
    )
    from highcharts.charts import RateLimitExceededException

    logger.info(f"Start generate word for request_id={request_id}")
    try:
        req = Request.objects.select_related("project").get(id=int(request_id))

        if not req.project:
            raise Project.DoesNotExist("Project does not exist")
        elif not req.project.async_complete:
            msg = "Not all async tasks are completed, retry later"
            raise WaitAsyncTaskException(msg)
        elif req.sent_file:
            raise WordAlreadySentException("Word already sent")

        logger.info("Start generating word")

        logger.info("Requested document: %s", req.requested_document)

        renderer_class = {
            RequestedDocumentChoices.RAPPORT_COMPLET: FullReportRenderer,
            RequestedDocumentChoices.RAPPORT_LOCAL: LocalReportRenderer,
            RequestedDocumentChoices.RAPPORT_CONSO: ConsoReportRenderer,
        }[req.requested_document]

        with renderer_class(request=req) as renderer:
            context = renderer.get_context_data()
            buffer = renderer.render_to_docx(context=context)
            filename = renderer.get_file_name()
            req.sent_file.save(filename, buffer, save=True)
            logger.info("Word created and saved")
            return request_id

    except (
        RateLimitExceededException,
        Project.DoesNotExist,
        WaitAsyncTaskException,
        WordAlreadySentException,
    ) as exc:
        req.record_exception(exc)
        logger.error("Error while generating word: %s", exc)
        logger.exception(exc)
        self.retry(exc=exc, countdown=5 ** (self.request.retries + 1))
    except Request.DoesNotExist as exc:
        logger.error("Request doesn't not exist, no retry.")
        logger.exception(exc)
    except Exception as exc:
        logger.error("Unknow exception, please investigate.")
        req.record_exception(exc)
        logger.exception(exc)
        self.retry(exc=exc, countdown=900)
    finally:
        logger.info("End generate word for request=%d", request_id)


@shared_task(bind=True, max_retries=5, queue="long")
def send_word_diagnostic(self, request_id) -> None:
    """
    Paramètres de l'e-mail dans SendInBlue:
    - diagnostic_url : lien pour télécharger le diagnostic
    - ocsge_available : booléen pour savoir si le diagnostic est disponible sur OCSGE, SendInBlue test seulement s'il
      est vide (OCS GE disponible)
    """
    logger.info(f"Start send word for request_id={request_id}")
    try:
        req = Request.objects.select_related("project").get(id=int(request_id))

        template_id = {
            RequestedDocumentChoices.RAPPORT_COMPLET: 8,
            RequestedDocumentChoices.RAPPORT_LOCAL: 61,
            RequestedDocumentChoices.RAPPORT_CONSO: 8,
        }[req.requested_document]

        diagnostic_name = {
            RequestedDocumentChoices.RAPPORT_COMPLET: req.project.name,
            RequestedDocumentChoices.RAPPORT_LOCAL: req.project.land.name,
            RequestedDocumentChoices.RAPPORT_CONSO: req.project.name,
        }[req.requested_document]

        email = SibTemplateEmail(
            template_id=template_id,
            recipients=[{"name": f"{req.first_name} {req.last_name}", "email": req.email}],
            params={
                "diagnostic_name": diagnostic_name,
                "image_url": req.project.cover_image.url,
                "ocsge_available": ("" if req.project.has_complete_uniform_ocsge_coverage else "display"),
                "diagnostic_url": get_url_with_domain(reverse("project:word_download", args=[req.id])),
            },
        )
        logger.info(email.send())
        logger.info("Email sent with success")
        req.sent()
        logger.info("Saving request state done")
    except Exception as exc:
        req.record_exception(exc)
        logger.error("Error while sending email, error: %s", exc)
        logger.exception(exc)
        self.retry(exc=exc, countdown=5 ** (self.request.retries + 1))
    finally:
        logger.info(f"End send word for request={request_id}")


def to_shapely_polygons(mpoly):
    srid, wkt = mpoly.ewkt.split(";")
    return shapely.wkt.loads(wkt)


def get_img(queryset, color: str, title: str) -> io.BytesIO:
    data: Dict[Literal["level", "geometry"], Any] = {"level": [], "geometry": []}
    for row in queryset:
        data["geometry"].append(to_shapely_polygons(row["mpoly"]))
        data["level"].append(float(row["level"]) if row["level"] else 0)

    gdf = geopandas.GeoDataFrame(data, crs="EPSG:4326").to_crs(epsg=3857)

    fig, ax = plt.subplots(figsize=(15, 10))
    plt.axis("off")
    fig.set_dpi(100)

    gdf.plot(
        "level",
        ax=ax,
        scheme="natural_breaks",
        k=5,
        legend=True,
        cmap=color,
        alpha=0.5,
        edgecolor="k",
        legend_kwds={"loc": "lower left"},
    )
    ax.add_artist(ScaleBar(1))
    ax.set_title(title)
    cx.add_basemap(ax, source=settings.OPENSTREETMAP_URL, zoom_adjust=1, alpha=0.95)

    img_data = io.BytesIO()
    plt.savefig(img_data, bbox_inches="tight", format="jpg")
    img_data.seek(0)
    plt.close()
    return img_data


@shared_task(bind=True, max_retries=5)
def generate_theme_map_conso(self, project_id) -> None:
    logger.info("Start generate_theme_map_conso, project_id=%d", project_id)

    try:
        diagnostic = Project.objects.get(id=int(project_id))
        diagnostic_communes_as_lands = [
            Land(public_key=f"{AdminRef.COMMUNE}_{commune.official_id}") for commune in diagnostic.cities.all()
        ]

        land_progressions = PublicDataContainer.consommation_progression_service().get_by_lands(
            lands=diagnostic_communes_as_lands,
            start_date=int(diagnostic.analyse_start_date),
            end_date=int(diagnostic.analyse_end_date),
        )

        data = [
            {
                "mpoly": land_progression.land.mpoly,
                "level": sum(annual_conso.per_mille_of_area for annual_conso in land_progression.consommation),
            }
            for land_progression in land_progressions
        ]

        image_title = (
            f"Taux de consommation d'espaces des communes du territoire «{diagnostic.land.name}» "
            f"entre {diagnostic.analyse_start_date} et {diagnostic.analyse_end_date} (en ‰ - pour mille)"
        )

        img_data = get_img(
            queryset=data,
            color="Blues",
            title=image_title,
        )

        race_protection_save_map(
            diagnostic.pk,
            "async_generate_theme_map_conso_done",
            "theme_map_conso",
            f"theme_map_conso_{project_id}.jpg",
            img_data,
        )

    except Project.DoesNotExist:
        logger.error(f"project_id={project_id} does not exist")

    except Exception as exc:
        logger.error(exc)
        logger.exception(exc)
        self.retry(exc=exc, countdown=300)

    finally:
        logger.info("End generate_theme_map_conso, project_id=%d", project_id)


@shared_task(bind=True, max_retries=5)
def generate_theme_map_artif(self, project_id) -> None:
    logger.info("Start generate_theme_map_artif, project_id=%d", project_id)

    try:
        diagnostic = Project.objects.get(id=int(project_id))
        qs = diagnostic.cities.all().annotate(level=F("surface_artif") * 100 / F("area"))

        data = [
            {
                "mpoly": row.mpoly,
                "level": row.level,
            }
            for row in qs
        ]

        title = (
            f"Taux d'artificialisation des communes du territoire "
            f"«{diagnostic.land.name}» en {diagnostic.last_year_ocsge} (en % - pour cent)"
        )

        img_data = get_img(
            queryset=data,
            color="OrRd",
            title=title,
        )

        race_protection_save_map(
            diagnostic.pk,
            "async_generate_theme_map_artif_done",
            "theme_map_artif",
            f"theme_map_artif_{project_id}.jpg",
            img_data,
        )

    except Project.DoesNotExist:
        logger.error(f"project_id={project_id} does not exist")

    except Exception as exc:
        logger.error(exc)
        logger.exception(exc)
        self.retry(exc=exc, countdown=300)

    finally:
        logger.info("End generate_theme_map_artif, project_id=%d", project_id)


@shared_task(bind=True, max_retries=5)
def generate_theme_map_understand_artif(self, project_id) -> None:
    logger.info("Start generate_theme_map_understand_artif, project_id=%d", project_id)

    try:
        diagnostic = Project.objects.get(id=int(project_id))

        geom = diagnostic.combined_emprise.transform("3857", clone=True)
        srid, wkt = geom.ewkt.split(";")
        polygons = shapely.wkt.loads(wkt)
        gdf_emprise = geopandas.GeoDataFrame({"geometry": [polygons]}, crs="EPSG:3857")

        data = {"color": [], "geometry": []}
        # add artificial area to data
        city_ids = diagnostic.cities.all().values_list("insee", flat=True)
        artif_areas = ArtificialArea.objects.filter(city__in=city_ids)

        artif_color = (0.97, 0.56, 0.33)
        new_artif_color = (1, 0, 0)
        new_natural_color = (0, 1, 0)

        for artif_area in artif_areas:
            polygons = shapely.wkt.loads(artif_area.mpoly.wkt)
            data["geometry"].append(polygons)
            data["color"].append(artif_color)

        # add new artificial area and new natural area to data
        qs_artif = OcsgeDiff.objects.intersect(diagnostic.combined_emprise).filter(
            Q(is_new_artif=True) | Q(is_new_natural=True)
        )
        for row in qs_artif.only("mpoly", "is_new_artif"):
            data["geometry"].append(to_shapely_polygons(row.mpoly))
            data["color"].append((1, 0, 0) if row.is_new_artif else (0, 1, 0))

        artif_area_gdf = geopandas.GeoDataFrame(data, crs="EPSG:4326").to_crs(epsg=3857)

        fig, ax = plt.subplots(figsize=(15, 10))
        plt.axis("off")
        fig.set_dpi(100)

        artif_area_gdf.plot(ax=ax, color=artif_area_gdf["color"], label="Artificialisation")
        gdf_emprise.plot(ax=ax, facecolor="none", edgecolor="black")
        emprise_legend_label = Line2D([], [], color="black", linewidth=3, label=diagnostic.territory_name)
        artif_legend_label = Line2D(
            [],
            [],
            linestyle="none",
            mfc=artif_color,
            mec=artif_color,
            marker="s",
            label=f"Surfaces atificialisées en {diagnostic.last_year_ocsge}",
        )
        new_artif_legend_label = Line2D(
            [], [], linestyle="none", mfc=new_artif_color, mec=new_artif_color, marker="s", label="Artificialisation"
        )
        new_natural_legend_label = Line2D(
            [],
            [],
            linestyle="none",
            mfc=new_natural_color,
            mec=new_natural_color,
            marker="s",
            label="Désartificialisation",
        )

        ax.add_artist(ScaleBar(1, location="lower right"))
        plt.legend(
            loc="upper left",
            handles=[
                emprise_legend_label,
                artif_legend_label,
                new_artif_legend_label,
                new_natural_legend_label,
            ],
        )
        ax.set_title(
            label=(
                "Etat des lieux de l'artificialisation "
                f"de territoire «{diagnostic.land.name}» entre {diagnostic.first_year_ocsge} à "
                f"{diagnostic.last_year_ocsge}"
            ),
            loc="left",
        )
        cx.add_basemap(ax, source=settings.OPENSTREETMAP_URL, zoom_adjust=1, alpha=0.95)
        cx.add_attribution(ax, text="Données: OCS GE (IGN)")

        img_data = io.BytesIO()
        plt.savefig(img_data, bbox_inches="tight", format="jpg")
        img_data.seek(0)

        race_protection_save_map(
            diagnostic.pk,
            "async_theme_map_understand_artif_done",
            "theme_map_understand_artif",
            f"theme_map_understand_artif_{project_id}.jpg",
            img_data,
        )

    except Project.DoesNotExist:
        logger.error(f"project_id={project_id} does not exist")

    except Exception as exc:
        logger.error(exc)
        logger.exception(exc)
        self.retry(exc=exc, countdown=300)

    finally:
        logger.info("End generate_theme_map_understand_artif, project_id=%d", project_id)


@shared_task(bind=True, max_retries=5)
def generate_theme_map_gpu(self, project_id) -> None:
    logger.info("Start generate_theme_map_gpu, project_id=%d", project_id)
    try:
        diagnostic = Project.objects.get(id=int(project_id))

        geom = diagnostic.combined_emprise.transform("3857", clone=True)
        srid, wkt = geom.ewkt.split(";")
        polygons = shapely.wkt.loads(wkt)
        gdf_emprise = geopandas.GeoDataFrame({"geometry": [polygons]}, crs="EPSG:3857")

        data = {"color": [], "geometry": []}

        for zone_urba in ZoneUrba.objects.intersect(diagnostic.combined_emprise):
            srid, wkt = zone_urba.intersection.ewkt.split(";")
            polygons = shapely.wkt.loads(wkt)
            data["geometry"].append(polygons)
            data["color"].append((*[_ / 255 for _ in zone_urba.get_color()], 0.9))

        zone_urba_gdf = geopandas.GeoDataFrame(data, crs="EPSG:4326").to_crs(epsg=3857)

        fig, ax = plt.subplots(figsize=(15, 10))
        plt.axis("off")
        fig.set_dpi(150)

        zone_urba_gdf.plot(ax=ax, color=zone_urba_gdf["color"])
        gdf_emprise.plot(ax=ax, facecolor="none", edgecolor="black")
        ax.add_artist(ScaleBar(1))
        ax.set_title(
            f"Les zones d'urbanisme du territoire «{diagnostic.territory_name}» en {diagnostic.analyse_end_date}"
        )
        cx.add_basemap(ax, source=settings.OPENSTREETMAP_URL)

        img_data = io.BytesIO()
        plt.savefig(img_data, bbox_inches="tight", format="jpg")
        plt.close()
        img_data.seek(0)

        race_protection_save_map(
            diagnostic.pk,
            "async_theme_map_gpu_done",
            "theme_map_gpu",
            f"theme_map_gpu_{project_id}.jpg",
            img_data,
        )

    except Project.DoesNotExist:
        logger.error(f"project_id={project_id} does not exist")

    except Exception as exc:
        logger.error(exc)
        logger.exception(exc)
        self.retry(exc=exc, countdown=300)

    finally:
        logger.info("End generate_theme_map_gpu, project_id=%d", project_id)


@shared_task(bind=True, max_retries=5)
def generate_theme_map_fill_gpu(self, project_id) -> None:
    logger.info("Start generate_theme_map_fill_gpu, project_id=%d", project_id)
    try:
        diagnostic = Project.objects.get(pk=project_id)
        zone_urba = ZoneUrba.objects.intersect(diagnostic.combined_emprise)
        qs = ArtifAreaZoneUrba.objects.filter(
            zone_urba__in=zone_urba,
            year__in=[diagnostic.first_year_ocsge, diagnostic.last_year_ocsge],
            zone_urba__typezone__in=["U", "AUc", "AUs"],
            zone_urba__area__gt=0,
        ).annotate(
            level=100 * F("area") / F("zone_urba__area"),
            mpoly=F("zone_urba__mpoly"),
        )

        data = [
            {
                "mpoly": item.mpoly,
                "level": item.level,
            }
            for item in qs
        ]

        title = (
            f"Taux d'artificialisation des zones urbaines (U) et à urbaniser (AU) du territoire "
            f"«{diagnostic.land.name}» en {diagnostic.last_year_ocsge} (en % - pour cent)"
        )

        if qs.count() > 0:
            img_data = get_img(
                queryset=data,
                color="OrRd",
                title=title,
            )
        else:
            geom = diagnostic.combined_emprise.transform("3857", clone=True)
            srid, wkt = geom.ewkt.split(";")
            polygons = shapely.wkt.loads(wkt)
            gdf_emprise = geopandas.GeoDataFrame({"geometry": [polygons]}, crs="EPSG:3857")
            fig, ax = plt.subplots(figsize=(15, 10))
            plt.axis("off")
            fig.set_dpi(150)
            gdf_emprise.plot(ax=ax, facecolor="none", edgecolor="black")
            ax.add_artist(ScaleBar(1))
            ax.set_title("Il n'y a pas de zone U ou AU")
            cx.add_basemap(ax, source=settings.OPENSTREETMAP_URL)

            img_data = io.BytesIO()
            plt.savefig(img_data, bbox_inches="tight", format="jpg")
            plt.close()
            img_data.seek(0)

        race_protection_save_map(
            diagnostic.pk,
            "async_theme_map_fill_gpu_done",
            "theme_map_fill_gpu",
            f"theme_map_fill_gpu_{project_id}.jpg",
            img_data,
        )

    except Project.DoesNotExist:
        logger.error(f"project_id={project_id} does not exist")

    except Exception as exc:
        logger.error(exc)
        logger.exception(exc)
        self.retry(exc=exc, countdown=300)

    finally:
        logger.info("End generate_theme_map_fill_gpu, project_id=%d", project_id)


@shared_task(bind=True, max_retries=5)
def alert_on_blocked_diagnostic(self) -> None:
    logger.info("Start alert_on_blocked_diagnostic")
    try:
        # set to done request with no project
        Request.objects.filter(done=False, project__isnull=True).update(done=True)
        # select request undone from more than 1 hour
        stamp = timezone.now() - timedelta(hours=1)
        qs = Request.objects.filter(done=False, created_date__lt=stamp).order_by("created_date", "project__name")
        diagnostic_list = [
            {
                "name": _.project.name if _.project else "Projet supprimé",
                "date": _.created_date.strftime("%d-%m-%Y"),
                "url": get_url_with_domain(reverse("admin:project_request_change", args=[_.id])),
            }
            for _ in qs
        ]
        total = qs.count()
        if total > 0:
            if settings.ALERT_DIAG_MEDIUM in ["mattermost", "both"] and settings.ALERT_DIAG_MATTERMOST_RECIPIENTS:
                for recipient in settings.ALERT_DIAG_MATTERMOST_RECIPIENTS:
                    BlockedDiagnostic(
                        channel=recipient,
                        data=[[_["date"], f'[{_["name"][:45]}]({_["url"]})'] for _ in diagnostic_list],
                    ).send()
            if settings.ALERT_DIAG_MEDIUM in ["email", "both"] and settings.ALERT_DIAG_EMAIL_RECIPIENTS:
                email = SibTemplateEmail(
                    template_id=10,
                    recipients=[{"email": _} for _ in settings.ALERT_DIAG_EMAIL_RECIPIENTS],
                    params={
                        "qte_diagnostics": total,
                        "diagnostic_list": diagnostic_list,
                        "enviroment": settings.ENVIRONMENT,
                    },
                )
                logger.info(email.send())
    except Exception as exc:
        logger.error(exc)
        logger.exception(exc)
        self.retry(exc=exc, countdown=60)

    finally:
        logger.info("End alert_on_blocked_diagnostic")
