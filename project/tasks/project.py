"""
Asyn tasks runned by Celery

Below functions are dedicated to loading a project data and pre calculate
all the indicators required to speedup process
"""

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
from django.db.models import F, OuterRef, Q, Subquery
from django.urls import reverse
from django.utils import timezone
from django_app_parameter import app_parameter
from matplotlib_scalebar.scalebar import ScaleBar

from diagnostic_word.renderers import Renderer
from project.models import Project, Request
from public_data.models import ArtificialArea, Cerema, Land, OcsgeDiff
from utils.db import fix_poly
from utils.emails import SibTemplateEmail
from utils.functions import get_url_with_domain
from utils.mattermost import BlockedDiagnostic

logger = logging.getLogger(__name__)


def race_protection_save(project_id: int, fields: Dict[str, Any]) -> None:
    with transaction.atomic():
        fields_name = list(fields.keys())
        diagnostic = (
            Project.objects.select_for_update().only(*fields_name).get(pk=project_id)
        )
        for name, value in fields.items():
            setattr(diagnostic, name, value)
        diagnostic._change_reason = "async"
        diagnostic.save(update_fields=fields_name)


def race_protection_save_map(
    project_id: int,
    field_flag_name: str,
    field_img_name: str,
    img_name: str,
    img_data: io.BytesIO,
) -> None:
    with transaction.atomic():
        diagnostic = (
            Project.objects.select_for_update()
            .only(field_img_name, field_flag_name)
            .get(pk=project_id)
        )
        field_img = getattr(diagnostic, field_img_name)
        field_img.delete(save=False)
        field_img.save(img_name, img_data, save=False)
        setattr(diagnostic, field_flag_name, True)
        diagnostic._change_reason = "async"
        diagnostic.save(update_fields=[field_img_name, field_flag_name])


@shared_task(bind=True, max_retries=5)
def add_city_and_set_combined_emprise(self, project_id: int, public_keys: str) -> None:
    """Do a Union() on all mpoly lands and set project combined emprise

    :param project_id: primary key to find Project
    :type project_id: integer
    :param public_keys: list of public keys separated by '-'
    :type public_keys: string
    """
    logger.info("Start add_city_and_set_combined_emprise id=%d", project_id)
    logger.info("public_keys=%s", public_keys)
    try:
        project = Project.objects.get(pk=project_id)
        combined_emprise = None
        lands = Land.get_lands(public_keys.split("-"))
        for land in lands:
            project.cities.add(*land.get_cities())
            if not combined_emprise:
                combined_emprise = land.mpoly
            else:
                combined_emprise = land.mpoly.union(combined_emprise)
        project.emprise_set.create(mpoly=fix_poly(combined_emprise))

        race_protection_save(project_id, {"async_city_and_combined_emprise_done": True})
    except Project.DoesNotExist:
        logger.error(f"project_id={project_id} does not exist")
    except Exception as exc:
        logger.error(exc)
        logger.exception(exc)
        self.retry(exc=exc, countdown=60)
    finally:
        logger.info("End add_city_and_set_combined_emprise, project_id=%d", project_id)


@shared_task(bind=True, max_retries=5)
def find_first_and_last_ocsge(self, project_id: int) -> None:
    """Use associated cities to find departements and available OCSGE millesime"""
    logger.info("Start find_first_and_last_ocsge id=%d", project_id)
    try:
        result = Project.objects.get(pk=project_id).get_first_last_millesime()
        race_protection_save(
            project_id,
            {
                "first_year_ocsge": result["first"],
                "last_year_ocsge": result["last"],
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


@shared_task
def send_email_request_bilan(request_id):
    """Alerte envoyée à l'équipe SPARTE pour les avertir d'une demande de Diagnostic."""
    logger.info("Start send_email_request_bilan, request_id=%s", request_id)
    request = Request.objects.get(pk=request_id)
    diagnostic = request.project
    project_url = get_url_with_domain(reverse("project:detail", args=[diagnostic.id]))
    relative_url = get_url_with_domain(
        reverse("admin:project_request_change", kwargs={"object_id": request.id})
    )
    image_url = "https://creative-assets.mailinblue.com/editor/image_placeholder.png"
    if diagnostic.cover_image:
        image_url = diagnostic.cover_image.url
    email = SibTemplateEmail(
        template_id=1,
        recipients=[{"name": "Team SPARTE", "email": app_parameter.TEAM_EMAIL}],
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
def add_neighboors(self, project_id):
    logger.info("Start add_neighboors, project_id=%d", project_id)
    try:
        project = Project.objects.get(pk=project_id)
        qs = project.get_neighbors()[:9]
        logger.info("Fetched %d neighboors", qs.count())
        public_keys = [_.public_key for _ in qs]
        logger.info("Neighboors: %s", ", ".join([_.name for _ in qs]))
        project.add_look_a_like(public_keys, many=True)
        logger.info("Listed neighboors : %s", project.look_a_like)

        race_protection_save(
            project_id,
            {
                "look_a_like": project.look_a_like,
                "async_add_neighboors_done": True,
            },
        )
    except Project.DoesNotExist:
        logger.error(f"project_id={project_id} does not exist")
    except Exception as exc:
        logger.error(exc)
        logger.exception(exc)
        self.retry(exc=exc, countdown=300)
    finally:
        logger.info("End add_neighboors, project_id=%d", project_id)


@shared_task(bind=True, max_retries=5)
def generate_cover_image(self, project_id):
    logger.info("Start generate_cover_image, project_id=%d", project_id)
    try:
        diagnostic = Project.objects.get(id=int(project_id))
        geom = diagnostic.combined_emprise.transform("2154", clone=True)
        srid, wkt = geom.ewkt.split(";")
        polygons = shapely.wkt.loads(wkt)

        gdf_emprise = geopandas.GeoDataFrame(
            {
                "col1": [
                    "emprise diagnostic",
                ],
                "geometry": [
                    polygons,
                ],
            },
            crs="EPSG:2154",
        ).to_crs(epsg=3857)

        fig, ax = plt.subplots(figsize=(60, 10))
        plt.axis("off")
        fig.set_dpi(72)

        gdf_emprise.buffer(250000).plot(ax=ax, facecolor="none", edgecolor="none")
        gdf_emprise.plot(ax=ax, facecolor="none", edgecolor="yellow")
        cx.add_basemap(ax, source=settings.ORTHOPHOTO_URL)

        img_data = io.BytesIO()
        plt.savefig(img_data, bbox_inches="tight")
        img_data.seek(0)
        plt.close()

        race_protection_save_map(
            diagnostic.pk,
            "async_cover_image_done",
            "cover_image",
            f"cover_{project_id}.png",
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


@shared_task(bind=True, max_retries=6)
def generate_word_diagnostic(self, request_id):
    from highcharts.charts import RateLimitExceededException

    logger.info(f"Start generate word for request={request_id}")
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
        with Renderer(
            project=req.project, word_template_slug="template-bilan-1"
        ) as renderer:
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
        self.retry(exc=exc, countdown=2 ** (self.request.retries + 10))
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


@shared_task(bind=True, max_retries=5)
def send_word_diagnostic(self, request_id):
    """
    Paramètres de l'e-mail dans SendInBlue:
    - diagnostic_url : lien pour télécharger le diagnostic
    - ocsge_available : booléen pour savoir si le diagnostic est disponible sur OCSGE, SendInBlue test seulement s'il
      est vide (OCS GE disponible)
    """
    logger.info(f"Start send word for request={request_id}")
    try:
        req = Request.objects.select_related("project").get(id=int(request_id))
        email = SibTemplateEmail(
            template_id=8,
            recipients=[
                {"name": f"{req.first_name} {req.last_name}", "email": req.email}
            ],
            params={
                "diagnostic_name": req.project.name,
                "image_url": req.project.cover_image.url,
                "ocsge_available": "" if req.project.is_artif() else "display",
                "diagnostic_url": get_url_with_domain(
                    reverse("project:word_download", args=[req.id])
                ),
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
        self.retry(exc=exc, countdown=2 ** (self.request.retries + 10))
    finally:
        logger.info(f"End send word for request={request_id}")


def to_shapely_polygons(mpoly):
    srid, wkt = mpoly.ewkt.split(";")
    return shapely.wkt.loads(wkt)


def get_img(queryset, color: str, title: str) -> io.BytesIO:
    data: Dict[Literal["level", "geometry"], Any] = {"level": [], "geometry": []}
    for row in queryset:
        data["geometry"].append(to_shapely_polygons(row.mpoly))
        data["level"].append(float(row.level) if row.level else 0)

    gdf = geopandas.GeoDataFrame(data, crs="EPSG:4326").to_crs(epsg=3857)

    fig, ax = plt.subplots(figsize=(15, 10))
    plt.axis("off")
    fig.set_dpi(150)

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
    cx.add_basemap(ax, source=settings.ORTHOPHOTO_URL)

    img_data = io.BytesIO()
    plt.savefig(img_data, bbox_inches="tight")
    img_data.seek(0)
    plt.close()
    return img_data


@shared_task(bind=True, max_retries=5)
def generate_theme_map_conso(self, project_id):
    logger.info("Start generate_theme_map_conso, project_id=%d", project_id)

    try:
        diagnostic = Project.objects.get(id=int(project_id))
        fields = Cerema.get_art_field(
            diagnostic.analyse_start_date, diagnostic.analyse_end_date
        )
        sub_qs = Cerema.objects.annotate(conso=sum(F(f) for f in fields))
        qs = diagnostic.cities.all().annotate(
            level=Subquery(
                sub_qs.filter(city_insee=OuterRef("insee")).values("conso")[:1]
            )
            / 10000
        )

        img_data = get_img(
            queryset=qs,
            color="OrRd",
            title="Consommation d'espaces des communes du territoire sur la période (en Ha)",
        )

        race_protection_save_map(
            diagnostic.pk,
            "async_generate_theme_map_conso_done",
            "theme_map_conso",
            f"theme_map_conso_{project_id}.png",
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
def generate_theme_map_artif(self, project_id):
    logger.info("Start generate_theme_map_artif, project_id=%d", project_id)

    try:
        diagnostic = Project.objects.get(id=int(project_id))
        qs = diagnostic.cities.all().annotate(level=F("surface_artif"))

        img_data = get_img(
            queryset=qs,
            color="Blues",
            title=(
                "Artificialisation d'espaces des communes du territoire "
                "sur la période (en Ha)"
            ),
        )

        race_protection_save_map(
            diagnostic.pk,
            "async_generate_theme_map_artif_done",
            "theme_map_artif",
            f"theme_map_artif_{project_id}.png",
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
def generate_theme_map_understand_artif(self, project_id):
    logger.info("Start generate_theme_map_understand_artif, project_id=%d", project_id)

    try:
        diagnostic = Project.objects.get(id=int(project_id))

        geom = diagnostic.combined_emprise.transform("3857", clone=True)
        srid, wkt = geom.ewkt.split(";")
        polygons = shapely.wkt.loads(wkt)
        gdf_emprise = geopandas.GeoDataFrame({"geometry": [polygons]}, crs="EPSG:3857")

        data = {"color": [], "geometry": []}
        # add artificial area to data
        queryset = ArtificialArea.objects.filter(city__in=diagnostic.cities.all())
        for row in queryset.only("mpoly"):
            srid, wkt = row.mpoly.ewkt.split(";")
            polygons = shapely.wkt.loads(wkt)
            data["geometry"].append(polygons)
            data["color"].append((0.97, 0.56, 0.33, 0.3))

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
        fig.set_dpi(150)

        artif_area_gdf.plot(ax=ax, color=artif_area_gdf["color"])
        gdf_emprise.plot(ax=ax, facecolor="none", edgecolor="yellow")
        ax.add_artist(ScaleBar(1))
        ax.set_title("Comprendre l'artificialisation de son territoire")
        cx.add_basemap(ax, source=settings.ORTHOPHOTO_URL)

        img_data = io.BytesIO()
        plt.savefig(img_data, bbox_inches="tight")
        plt.close()
        img_data.seek(0)

        race_protection_save_map(
            diagnostic.pk,
            "async_theme_map_understand_artif_done",
            "theme_map_understand_artif",
            f"theme_map_understand_artif_{project_id}.png",
            img_data,
        )

    except Project.DoesNotExist:
        logger.error(f"project_id={project_id} does not exist")

    except Exception as exc:
        logger.error(exc)
        logger.exception(exc)
        self.retry(exc=exc, countdown=300)

    finally:
        logger.info(
            "End generate_theme_map_understand_artif, project_id=%d", project_id
        )


@shared_task(bind=True, max_retries=5)
def alert_on_blocked_diagnostic(self):
    logger.info("Start alert_on_blocked_diagnostic")
    try:
        # set to done request with no project
        Request.objects.filter(done=False, project__isnull=True).update(done=True)
        # select request undone from more than 1 hour
        stamp = timezone.now() - timedelta(hours=1)
        qs = Request.objects.filter(done=False, created_date__lt=stamp).order_by(
            "created_date", "project__name"
        )
        diagnostic_list = [
            {
                "name": _.project.name if _.project else "Projet supprimé",
                "date": _.created_date.strftime("%d-%m-%Y"),
                "url": get_url_with_domain(
                    reverse("admin:project_request_change", args=[_.id])
                ),
            }
            for _ in qs
        ]
        total = qs.count()
        if total > 0:
            if (
                settings.ALERT_DIAG_MEDIUM in ["mattermost", "both"]
                and settings.ALERT_DIAG_MATTERMOST_RECIPIENTS
            ):
                for recipient in settings.ALERT_DIAG_MATTERMOST_RECIPIENTS:
                    BlockedDiagnostic(
                        channel=recipient,
                        data=[
                            [_["date"], f'[{_["name"][:45]}]({_["url"]})']
                            for _ in diagnostic_list
                        ],
                    ).send()
            if (
                settings.ALERT_DIAG_MEDIUM in ["email", "both"]
                and settings.ALERT_DIAG_EMAIL_RECIPIENTS
            ):
                email = SibTemplateEmail(
                    template_id=10,
                    recipients=[
                        {"email": _} for _ in settings.ALERT_DIAG_EMAIL_RECIPIENTS
                    ],
                    params={
                        "qte_diagnostics": total,
                        "diagnostic_list": diagnostic_list,
                    },
                )
                logger.info(email.send())
    except Exception as exc:
        logger.error(exc)
        logger.exception(exc)
        self.retry(exc=exc, countdown=60)

    finally:
        logger.info("End alert_on_blocked_diagnostic")
