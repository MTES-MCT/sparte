from django.db import DatabaseError, models, transaction


class NationalMapGeoJSON(models.Model):
    """Fonds de la carte nationale précalculés par dbt, par territoire parent et par maille.

    Géométries très simplifiées et coordonnées arrondies au mètre : bien plus légers que
    ``LandGeoJSON``, et disponibles pour la France entière à la maille EPCI.
    """

    land_id = models.CharField(max_length=255)
    land_type = models.CharField(max_length=50)
    child_land_type = models.CharField(max_length=50)
    geojson = models.JSONField()

    class Meta:
        managed = False
        db_table = "public_data_national_map_geojson"

    @classmethod
    def for_parent(cls, land_id, land_type, child_land_type):
        """GeoJSON des territoires de la maille sous ce parent, ou None s'il n'est pas précalculé.

        La table n'existe qu'après un passage du DAG ``update_app`` : tant qu'elle manque,
        on renvoie None pour que l'appelant se rabatte sur ``LandGeoJSON``.
        """
        try:
            # Point de sauvegarde : une table absente ne doit pas invalider la transaction de la requête
            with transaction.atomic():
                return (
                    cls.objects.filter(land_id=land_id, land_type=land_type, child_land_type=child_land_type)
                    .values_list("geojson", flat=True)
                    .first()
                )
        except DatabaseError:
            return None
