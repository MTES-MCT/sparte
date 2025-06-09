from django.db import models


class LandFricheGeojson(models.Model):
    land_id = models.CharField()
    land_type = models.CharField()
    land_name = models.CharField()
    geojson_feature_collection = models.JSONField()

    class Meta:
        managed = False
        db_table = "public_data_landfrichegeojson"
