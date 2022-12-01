"""
Asyn tasks runned by Celery

Below functions are dedicated to loading a project data and pre calculate
all the indicators required to speedup process
"""
from celery import shared_task
import contextily as cx
import geopandas
import io
import logging
import matplotlib.pyplot as plt
from matplotlib_scalebar.scalebar import ScaleBar
import shapely
import traceback

from django.conf import settings
from django.db.models import F, Subquery, OuterRef, Q
from django.urls import reverse
from django_app_parameter import app_parameter

from utils.db import fix_poly
from utils.emails import send_template_email
from utils.functions import get_url_with_domain
from project.models import Project, Request
from public_data.models import Land, Cerema, OcsgeDiff, ArtificialArea


logger = logging.getLogger(__name__)


@shared_task
def process_project_with_shape(project_id: int):
    """Prep project when emprise is set from a shape file"""
    raise DeprecationWarning("taks.process_project: Do not use anymore")


@shared_task
def build_emprise_from_city(project_id: int):
    """Triggered if no shape file has been provided"""
    raise DeprecationWarning("taks.process_project: Do not use anymore")


@shared_task
def process_project(project_id: int):
    """Will trigger correct processing according to emprise's origine"""
    raise DeprecationWarning("taks.process_project: Do not use anymore")


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
        project.async_city_and_combined_emprise_done = True
        project.save(update_fields=["async_city_and_combined_emprise_done"])
    except Project.DoesNotExist:
        logger.error(f"project_id={project_id} does not exist")
    except Exception as exc:
        self.retry(exc=exc, countdown=300)
        logger.error(exc)
    logger.info("End add_city_and_set_combined_emprise, project_id=%d", project_id)


@shared_task(bind=True, max_retries=5)
def find_first_and_last_ocsge(self, project_id: int) -> None:
    """Use associated cities to find departements and available OCSGE millesime"""
    logger.info("Start find_first_and_last_ocsge id=%d", project_id)
    try:
        project = Project.objects.get(pk=project_id)
        result = project.get_first_last_millesime()
        project.first_year_ocsge = result["first"]
        project.last_year_ocsge = result["last"]
        project.async_find_first_and_last_ocsge_done = True
        # be aware of several updating in parallele. update only selected fields
        # to avoid loose previously saved data
        project.save(
            update_fields=[
                "first_year_ocsge",
                "last_year_ocsge",
                "async_find_first_and_last_ocsge_done",
            ]
        )
    except Project.DoesNotExist:
        logger.error(f"project_id={project_id} does not exist")
    except Exception as exc:
        self.retry(exc=exc, countdown=300)
        logger.error(exc)
    logger.info("End find_first_and_last_ocsge, project_id=%d", project_id)


@shared_task
def send_email_request_bilan(request_id):
    """Il faut envoyer 2 e-mails: 1 au demandeur et 1 à l'équipe SPARTE"""
    logger.info("Start send_email_request_bilan, request_id=%s", request_id)
    request = Request.objects.get(pk=request_id)
    project_url = get_url_with_domain(request.project.get_absolute_url())
    relative_url = reverse(
        "admin:project_request_change", kwargs={"object_id": request.id}
    )
    send_template_email(
        subject=f"Demande de bilan - {request.email} - {request.project.name}",
        recipients=[app_parameter.TEAM_EMAIL],
        template_name="project/emails/dl_diagnostic_team",
        context={
            "project": request.project,
            "request": request,
            "project_url": project_url,
            "request_url": get_url_with_domain(relative_url),
        },
    )
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
        # logger.info("public_keys: %s", ", ".join(public_keys))
        project.add_look_a_like(public_keys, many=True)
        logger.info("Listed neighboors : %s", project.look_a_like)
        project.async_add_neighboors_done = True
        project.save(update_fields=["look_a_like", "async_add_neighboors_done"])
    except Project.DoesNotExist:
        logger.error(f"project_id={project_id} does not exist")
    except Exception as exc:
        self.retry(exc=exc, countdown=300)
        logger.error(exc)
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
        fig.set_dpi(150)

        gdf_emprise.buffer(250000).plot(ax=ax, facecolor="none", edgecolor="none")
        gdf_emprise.plot(ax=ax, facecolor="none", edgecolor="yellow")
        cx.add_basemap(ax, source=settings.ORTHOPHOTO_URL)

        img_data = io.BytesIO()
        plt.savefig(img_data, bbox_inches="tight")
        img_data.seek(0)
        plt.close()

        diagnostic.cover_image.delete(save=False)
        diagnostic.cover_image.save(f"cover_{project_id}.png", img_data, save=False)
        diagnostic.async_cover_image_done = True
        diagnostic.save(update_fields=["cover_image", "async_cover_image_done"])

    except Project.DoesNotExist as exc:
        self.retry(exc=exc, countdown=300)
        logger.error(f"project_id={project_id} does not exist")
    except Exception as exc:
        self.retry(exc=exc, countdown=300)
        logger.error(exc)
    logger.info("End generate_cover_image, project_id=%d", project_id)


@shared_task(bind=True, max_retries=5)
def generate_word_diagnostic(self, request_id):
    from django_docx_template.models import DocxTemplate
    from highcharts.charts import RateLimitExceededException

    logger.info(f"Start generate word for request={request_id}")
    try:
        req = Request.objects.get(id=int(request_id))
        if not req.sent_file:
            logger.info("Start generating word")
            template = DocxTemplate.objects.get(slug="template-bilan-1")
            buffer = template.merge(pk=req.project_id)
            filename = template.get_file_name()
            req.sent_file.save(filename, buffer, save=True)
            logger.info("Word created and saved")
        return request_id
    except RateLimitExceededException as exc:
        self.retry(exc=exc, countdown=2 ** (self.request.retries + 10))
        req.record_exception(exc)
        logger.error("Error while generating word: %s", exc)
    except Exception as exc:
        req.record_exception(exc)
        logger.exception(exc)
        self.retry(exc=exc, countdown=900)
    finally:
        logger.info("End generate word for request=%d", request_id)


@shared_task(bind=True, max_retries=5)
def send_word_diagnostic(self, request_id):
    from utils.emails import prep_email

    logger.info(f"Start send word for request={request_id}")
    try:
        req = Request.objects.select_related("project").get(id=int(request_id))
        filename = req.sent_file.name.split("/")[-1]
        buffer = req.sent_file.open().read()
        # sending email
        msg = prep_email(
            "Bilan issu de SPARTE",
            [req.email],
            "project/emails/send_diagnostic",
            context={"request": req, "ocsge_available": req.project.is_artif()},
        )
        msg.attach(filename, buffer)
        msg.send()
        logger.info("Email sent with success")
        req.sent()
        logger.info("Saving request state done")
    except Exception as exc:
        self.retry(exc=exc, countdown=2 ** (self.request.retries + 10))
        req.record_exception(exc)
        logger.error("Error while sending email, error: %s", exc)
    finally:
        logger.info(f"End send word for request={request_id}")


def to_shapely_polygons(mpoly):
    srid, wkt = mpoly.ewkt.split(";")
    return shapely.wkt.loads(wkt)


def get_img(queryset, color: str, title: str) -> io.BytesIO:
    data = {"level": [], "geometry": []}
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
            title="Consommation d'espace des communes du territoire sur la période (en Ha)",
        )

        diagnostic.theme_map_conso.delete(save=False)
        diagnostic.theme_map_conso.save(
            f"theme_map_conso_{project_id}.png", img_data, save=False
        )
        diagnostic.async_generate_theme_map_conso_done = True
        diagnostic.save(
            update_fields=["theme_map_conso", "async_generate_theme_map_conso_done"]
        )

    except Project.DoesNotExist as exc:
        logger.error(f"project_id={project_id} does not exist")
        logger.exception(exc)
        self.retry(exc=exc, countdown=300)

    except Exception as exc:
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
            title="Artificialisation d'espace des communes du territoire sur la période (en Ha)",
        )

        diagnostic.theme_map_artif.delete(save=False)
        diagnostic.theme_map_artif.save(
            f"theme_map_artif_{project_id}.png", img_data, save=False
        )
        diagnostic.async_generate_theme_map_artif_done = True
        diagnostic.save(
            update_fields=["theme_map_artif", "async_generate_theme_map_artif_done"]
        )

    except Project.DoesNotExist as exc:
        logger.error(f"project_id={project_id} does not exist")
        self.retry(exc=exc, countdown=300)

    except Exception as exc:
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

        diagnostic.theme_map_understand_artif.delete(save=False)
        diagnostic.theme_map_understand_artif.save(
            f"theme_map_understand_artif_{project_id}.png", img_data, save=False
        )
        diagnostic.async_theme_map_understand_artif_done = True
        diagnostic.save(
            update_fields=[
                "theme_map_understand_artif",
                "async_theme_map_understand_artif_done",
            ]
        )

    except Project.DoesNotExist as exc:
        logger.error(f"project_id={project_id} does not exist")
        self.retry(exc=exc, countdown=300)

    except Exception as exc:
        logger.exception(exc)
        self.retry(exc=exc, countdown=300)

    finally:
        logger.info(
            "End generate_theme_map_understand_artif, project_id=%d", project_id
        )
