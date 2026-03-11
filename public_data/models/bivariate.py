from django.db import models


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
