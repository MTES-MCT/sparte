from logging import getLogger

from django.db import connection
from django.db.models.query import QuerySet

from public_data.models import CommuneSol
from public_data.models.administration import Commune

logger = getLogger(__name__)


class CalculateCommuneUsageEtCouvertureRepartition:
    @staticmethod
    def execute(commune: Commune) -> QuerySet[CommuneSol]:
        CommuneSol.objects.filter(city=commune).delete()
        with connection.cursor() as cursor:
            cursor.execute(
                sql="""
                INSERT INTO public_data_communesol (
                    city_id,
                    year,
                    matrix_id,
                    surface
                )
                SELECT
                    com.id AS city_id,
                    o.year,
                    matrix.id AS matrix_id,
                    St_Area(ST_Union(ST_Intersection(
                        ST_Transform(com.mpoly, com.srid_source),
                        ST_Transform(o.mpoly, o.srid_source)))
                    ) / 10000 AS surface
                FROM
                    public_data_commune AS com
                LEFT JOIN
                    public_data_ocsge AS o ON
                    ST_Intersects(com.mpoly, o.mpoly)
                LEFT JOIN
                    public_data_couverturesol AS cs ON
                    o.couverture = cs.code_prefix
                LEFT JOIN
                    public_data_usagesol AS us ON
                    o.usage = us.code_prefix
                LEFT JOIN
                    public_data_couvertureusagematrix AS matrix ON
                    matrix.couverture_id = cs.id AND
                    matrix.usage_id = us.id
                WHERE
                    com.insee = %s
                GROUP BY com.insee, com.id, o.year, o.couverture, o.usage, matrix.id, cs.code_prefix, us.code_prefix
            """,
                params=[commune.insee],
            )
        return CommuneSol.objects.filter(city=commune)
