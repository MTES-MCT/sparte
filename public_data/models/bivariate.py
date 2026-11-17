import logging
import time

from django.db import DatabaseError, models, transaction

__all__ = [
    "BivariateLandRate",
    "BivariateConsoThreshold",
    "BivariateIndicThreshold",
    "NationalMapBivariateRate",
]

logger = logging.getLogger(__name__)

# Codes d'erreur de PostgreSQL (SQLSTATE) d'une table ou d'une colonne qui n'existe pas
UNDEFINED_TABLE = "42P01"
UNDEFINED_COLUMN = "42703"

# Tant que la table compacte manque, chaque réponse de la carte passe par le repli : on n'en garde
# qu'une trace par motif et par heure dans chaque processus.
FALLBACK_LOG_INTERVAL = 60 * 60
_fallback_logged_at: dict[str, float] = {}


def _log_fallback(table: str, error: DatabaseError) -> None:
    """Trace l'abandon de la lecture de ``table``, sans répéter le même motif avant ``FALLBACK_LOG_INTERVAL``.

    Une table ou une colonne absente est attendue tant que le DAG ``update_app`` ne l'a pas copiée :
    simple avertissement. Toute autre erreur est tracée comme telle, avec sa pile d'appels.
    """
    cause = error.__cause__
    sqlstate = getattr(cause, "sqlstate", None) or getattr(cause, "pgcode", None)
    reason = sqlstate or type(error).__name__
    now = time.monotonic()
    logged_at = _fallback_logged_at.get(reason)
    if logged_at is not None and now - logged_at < FALLBACK_LOG_INTERVAL:
        return
    _fallback_logged_at[reason] = now
    if sqlstate in (UNDEFINED_TABLE, UNDEFINED_COLUMN):
        logger.warning(
            "Table %s indisponible (%s) : repli sur la table d'origine, plus lente, jusqu'à sa copie par le DAG"
            " update_app",
            table,
            str(error).splitlines()[0],
        )
    else:
        logger.error("Lecture de la table %s en échec : repli sur la table d'origine", table, exc_info=error)


class BivariateLandRate(models.Model):
    indicator = models.CharField(max_length=50)
    conso_field = models.CharField(max_length=20)
    land_id = models.CharField(max_length=50)
    land_type = models.CharField(max_length=10)
    start_year = models.IntegerField()
    end_year = models.IntegerField()
    conso_rate = models.FloatField(null=True)
    conso_ha = models.FloatField(null=True)
    indic_rate = models.FloatField(null=True)

    class Meta:
        managed = False
        db_table = "public_data_bivariate_land_rate"


class BivariateConsoThreshold(models.Model):
    land_type = models.CharField(max_length=10)
    conso_field = models.CharField(max_length=20)
    start_year = models.IntegerField()
    end_year = models.IntegerField()
    t1_min = models.FloatField()
    t1_max = models.FloatField()
    t2_min = models.FloatField()
    t2_max = models.FloatField()
    t3_min = models.FloatField()
    t3_max = models.FloatField()

    class Meta:
        managed = False
        db_table = "public_data_bivariate_conso_threshold"


class BivariateIndicThreshold(models.Model):
    indicator = models.CharField(max_length=50)
    land_type = models.CharField(max_length=10)
    start_year = models.IntegerField()
    end_year = models.IntegerField()
    t1_min = models.FloatField()
    t1_max = models.FloatField()
    t2_min = models.FloatField()
    t2_max = models.FloatField()
    t3_min = models.FloatField()
    t3_max = models.FloatField()

    class Meta:
        managed = False
        db_table = "public_data_bivariate_indic_threshold"


class NationalMapBivariateRate(models.Model):
    """Taux des cartes bivariées de la carte nationale : une ligne par territoire et par période.

    Mêmes valeurs que ``BivariateLandRate``, mais une colonne par taux et des lignes rangées par
    maille, période puis territoire : la carte lit une maille et une période dans quelques
    centaines de pages contiguës, au lieu de pages dispersées dans toute la table d'origine.
    """

    land_type = models.CharField(max_length=10)
    start_year = models.IntegerField()
    end_year = models.IntegerField()
    land_id = models.CharField(max_length=50)
    conso_rate_activite = models.FloatField(null=True)
    conso_rate_habitat = models.FloatField(null=True)
    indic_rate_emploi = models.FloatField(null=True)
    indic_rate_menages = models.FloatField(null=True)
    indic_rate_population = models.FloatField(null=True)

    class Meta:
        managed = False
        db_table = "public_data_national_map_bivariate_rate"

    @classmethod
    def rows_for_period(cls, land_type, period, columns, land_ids=None):
        """Lignes ``(land_id, *columns)`` de la maille pour la période, ou None si la table n'est pas disponible.

        ``land_ids`` (liste d'identifiants) restreint la lecture à ces territoires. La table n'a
        d'index que sur (maille, période) : PostgreSQL parcourt la période puis écarte les autres
        territoires, quel que soit leur nombre.

        La table n'existe qu'après un passage du DAG ``update_app`` : tant qu'elle manque (ou
        qu'il lui manque une colonne demandée), on renvoie None pour que l'appelant se rabatte
        sur ``BivariateLandRate``. Il en va de même pour toute autre erreur de la base : la carte
        reste servie, et le repli laisse une trace dans les journaux (``_log_fallback``).
        """
        start_year, end_year = period
        rows = cls.objects.filter(land_type=land_type, start_year=start_year, end_year=end_year)
        if land_ids is not None:
            rows = rows.filter(land_id__in=land_ids)
        try:
            # Point de sauvegarde : une table absente ne doit pas invalider la transaction de la requête
            with transaction.atomic():
                return list(rows.values_list("land_id", *columns))
        except DatabaseError as error:
            _log_fallback(cls._meta.db_table, error)
            return None
