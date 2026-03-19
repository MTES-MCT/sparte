from django.db import models

from public_data.models.administration import AdminRef


class LandDcPopulation(models.Model):
    land_id = models.CharField()
    land_type = models.CharField(choices=AdminRef.CHOICES)

    # year 22
    population_22 = models.FloatField(null=True)
    pop_0_14_22 = models.FloatField(null=True)
    pop_15_29_22 = models.FloatField(null=True)
    pop_30_44_22 = models.FloatField(null=True)
    pop_45_59_22 = models.FloatField(null=True)
    pop_60_74_22 = models.FloatField(null=True)
    pop_75_89_22 = models.FloatField(null=True)
    pop_90_plus_22 = models.FloatField(null=True)
    pop_hommes_22 = models.FloatField(null=True)
    pop_femmes_22 = models.FloatField(null=True)
    pop_hommes_0_19_22 = models.FloatField(null=True)
    pop_hommes_20_64_22 = models.FloatField(null=True)
    pop_hommes_65_plus_22 = models.FloatField(null=True)
    pop_femmes_0_19_22 = models.FloatField(null=True)
    pop_femmes_20_64_22 = models.FloatField(null=True)
    pop_femmes_65_plus_22 = models.FloatField(null=True)

    # year 16
    population_16 = models.FloatField(null=True)
    pop_0_14_16 = models.FloatField(null=True)
    pop_15_29_16 = models.FloatField(null=True)
    pop_30_44_16 = models.FloatField(null=True)
    pop_45_59_16 = models.FloatField(null=True)
    pop_60_74_16 = models.FloatField(null=True)
    pop_75_89_16 = models.FloatField(null=True)
    pop_90_plus_16 = models.FloatField(null=True)
    pop_hommes_16 = models.FloatField(null=True)
    pop_femmes_16 = models.FloatField(null=True)
    pop_hommes_0_19_16 = models.FloatField(null=True)
    pop_hommes_20_64_16 = models.FloatField(null=True)
    pop_hommes_65_plus_16 = models.FloatField(null=True)
    pop_femmes_0_19_16 = models.FloatField(null=True)
    pop_femmes_20_64_16 = models.FloatField(null=True)
    pop_femmes_65_plus_16 = models.FloatField(null=True)

    # year 11
    population_11 = models.FloatField(null=True)
    pop_0_14_11 = models.FloatField(null=True)
    pop_15_29_11 = models.FloatField(null=True)
    pop_30_44_11 = models.FloatField(null=True)
    pop_45_59_11 = models.FloatField(null=True)
    pop_60_74_11 = models.FloatField(null=True)
    pop_75_89_11 = models.FloatField(null=True)
    pop_90_plus_11 = models.FloatField(null=True)
    pop_hommes_11 = models.FloatField(null=True)
    pop_femmes_11 = models.FloatField(null=True)
    pop_hommes_0_19_11 = models.FloatField(null=True)
    pop_hommes_20_64_11 = models.FloatField(null=True)
    pop_hommes_65_plus_11 = models.FloatField(null=True)
    pop_femmes_0_19_11 = models.FloatField(null=True)
    pop_femmes_20_64_11 = models.FloatField(null=True)
    pop_femmes_65_plus_11 = models.FloatField(null=True)

    class Meta:
        managed = False
        db_table = "public_data_dc_population"
