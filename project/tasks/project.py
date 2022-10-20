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
import shapely

from django.urls import reverse
from django_app_parameter import app_parameter

from utils.db import fix_poly
from utils.emails import send_template_email
from utils.functions import get_url_with_domain
from project.models import Project, Request
from public_data.models import Land


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
    except Project.DoesNotExist:
        logger.error(f"project_id={project_id} does not exist")
    except Exception as exc:
        self.retry(exc=exc, countdown=300)
        logger.error(exc)
    logger.info("End add_city_and_set_combined_emprise")


@shared_task(bind=True, max_retries=5)
def find_first_and_last_ocsge(self, project_id: int) -> None:
    """Use associated cities to find departements and available OCSGE millesime"""
    logger.info("Start find_first_and_last_ocsge id=%d", project_id)
    try:
        project = Project.objects.get(pk=project_id)
        result = project.get_first_last_millesime()
        project.first_year_ocsge = result["first"]
        project.last_year_ocsge = result["last"]
        # be aware of several updating in parallele. update only selected fields
        # to avoid loose previously saved data
        project.save(update_fields=["first_year_ocsge", "last_year_ocsge"])
    except Project.DoesNotExist:
        logger.error(f"project_id={project_id} does not exist")
    except Exception as exc:
        self.retry(exc=exc, countdown=300)
        logger.error(exc)
    logger.info("End find_first_and_last_ocsge")


@shared_task
def send_email_request_bilan(request_id):
    """Il faut envoyer 2 e-mails: 1 au demandeur et 1 à l'équipe SPARTE"""
    logger.info("Start send_email_request_bilan")
    logger.info("Request_id=%s", request_id)
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
    logger.info("End send_email_request_bilan")


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
        project.save(update_fields=["look_a_like"])
    except Project.DoesNotExist:
        logger.error(f"project_id={project_id} does not exist")
    except Exception as exc:
        self.retry(exc=exc, countdown=300)
        logger.error(exc)
    logger.info("End add_neighboors")


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
        cx.add_basemap(
            ax,
            source=(
                "https://wxs.ign.fr/ortho/geoportail/wmts?"
                "&REQUEST=GetTile&SERVICE=WMTS&VERSION=1.0.0&TILEMATRIXSET=PM"
                "&LAYER=ORTHOIMAGERY.ORTHOPHOTOS&STYLE=normal&FORMAT=image/jpeg"
                "&TILECOL={x}&TILEROW={y}&TILEMATRIX={z}"
            ),
        )

        img_data = io.BytesIO()
        plt.savefig(img_data, bbox_inches="tight")
        img_data.seek(0)
        diagnostic.cover_image.delete(save=False)
        diagnostic.cover_image.save(f"cover_{project_id}.png", img_data, save=True)
        plt.close()
    except Project.DoesNotExist as exc:
        self.retry(exc=exc, countdown=300)
        logger.error(f"project_id={project_id} does not exist")
    except Exception as exc:
        self.retry(exc=exc, countdown=300)
        logger.error(exc)
    logger.info("End generate_cover_image")


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
        logger.error("Error while generating word: %s", exc)
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
