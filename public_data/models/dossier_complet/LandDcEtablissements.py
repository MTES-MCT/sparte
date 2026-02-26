from django.db import models

from public_data.models.administration import AdminRef


class LandDcEtablissements(models.Model):
    land_id = models.CharField()
    land_type = models.CharField(choices=AdminRef.CHOICES)

    # etablissements_total
    etablissements_total = models.FloatField(null=True)

    # etablissements par secteur
    etablissements_az = models.FloatField(null=True)
    etablissements_be = models.FloatField(null=True)
    etablissements_fz = models.FloatField(null=True)
    etablissements_gu = models.FloatField(null=True)
    etablissements_oq = models.FloatField(null=True)

    # etablissements par taille (taille_0)
    etablissements_taille_0 = models.FloatField(null=True)
    etablissements_az_taille_0 = models.FloatField(null=True)
    etablissements_be_taille_0 = models.FloatField(null=True)
    etablissements_fz_taille_0 = models.FloatField(null=True)
    etablissements_gu_taille_0 = models.FloatField(null=True)
    etablissements_oq_taille_0 = models.FloatField(null=True)

    # etablissements par taille (taille_1)
    etablissements_taille_1 = models.FloatField(null=True)
    etablissements_az_taille_1 = models.FloatField(null=True)
    etablissements_be_taille_1 = models.FloatField(null=True)
    etablissements_fz_taille_1 = models.FloatField(null=True)
    etablissements_gu_taille_1 = models.FloatField(null=True)
    etablissements_oq_taille_1 = models.FloatField(null=True)

    # etablissements par taille (taille_10)
    etablissements_taille_10 = models.FloatField(null=True)
    etablissements_az_taille_10 = models.FloatField(null=True)
    etablissements_be_taille_10 = models.FloatField(null=True)
    etablissements_fz_taille_10 = models.FloatField(null=True)
    etablissements_gu_taille_10 = models.FloatField(null=True)
    etablissements_oq_taille_10 = models.FloatField(null=True)

    # etablissements par taille (taille_20)
    etablissements_taille_20 = models.FloatField(null=True)
    etablissements_az_taille_20 = models.FloatField(null=True)
    etablissements_be_taille_20 = models.FloatField(null=True)
    etablissements_fz_taille_20 = models.FloatField(null=True)
    etablissements_gu_taille_20 = models.FloatField(null=True)
    etablissements_oq_taille_20 = models.FloatField(null=True)

    # etablissements par taille (taille_50)
    etablissements_taille_50 = models.FloatField(null=True)
    etablissements_az_taille_50 = models.FloatField(null=True)
    etablissements_be_taille_50 = models.FloatField(null=True)
    etablissements_fz_taille_50 = models.FloatField(null=True)
    etablissements_gu_taille_50 = models.FloatField(null=True)
    etablissements_oq_taille_50 = models.FloatField(null=True)

    # effectifs_total
    effectifs_total = models.FloatField(null=True)

    # effectifs par secteur
    effectifs_az = models.FloatField(null=True)
    effectifs_be = models.FloatField(null=True)
    effectifs_fz = models.FloatField(null=True)
    effectifs_gu = models.FloatField(null=True)
    effectifs_oq = models.FloatField(null=True)

    # effectifs par taille (taille_1)
    effectifs_taille_1 = models.FloatField(null=True)
    effectifs_az_taille_1 = models.FloatField(null=True)
    effectifs_be_taille_1 = models.FloatField(null=True)
    effectifs_fz_taille_1 = models.FloatField(null=True)
    effectifs_gu_taille_1 = models.FloatField(null=True)
    effectifs_oq_taille_1 = models.FloatField(null=True)

    # effectifs par taille (taille_10)
    effectifs_taille_10 = models.FloatField(null=True)
    effectifs_az_taille_10 = models.FloatField(null=True)
    effectifs_be_taille_10 = models.FloatField(null=True)
    effectifs_fz_taille_10 = models.FloatField(null=True)
    effectifs_gu_taille_10 = models.FloatField(null=True)
    effectifs_oq_taille_10 = models.FloatField(null=True)

    # effectifs par taille (taille_20)
    effectifs_taille_20 = models.FloatField(null=True)
    effectifs_az_taille_20 = models.FloatField(null=True)
    effectifs_be_taille_20 = models.FloatField(null=True)
    effectifs_fz_taille_20 = models.FloatField(null=True)
    effectifs_gu_taille_20 = models.FloatField(null=True)
    effectifs_oq_taille_20 = models.FloatField(null=True)

    # effectifs par taille (taille_50)
    effectifs_taille_50 = models.FloatField(null=True)
    effectifs_az_taille_50 = models.FloatField(null=True)
    effectifs_be_taille_50 = models.FloatField(null=True)
    effectifs_fz_taille_50 = models.FloatField(null=True)
    effectifs_gu_taille_50 = models.FloatField(null=True)
    effectifs_oq_taille_50 = models.FloatField(null=True)

    # effectifs taille_100_plus
    effectifs_taille_100_plus = models.FloatField(null=True)
    effectifs_az_taille_100_plus = models.FloatField(null=True)
    effectifs_be_taille_100_plus = models.FloatField(null=True)
    effectifs_fz_taille_100_plus = models.FloatField(null=True)
    effectifs_gu_taille_100_plus = models.FloatField(null=True)
    effectifs_oq_taille_100_plus = models.FloatField(null=True)

    # spheres et particuliers
    etablissements_sphere_presentielle = models.FloatField(null=True)
    etablissements_sphere_productive = models.FloatField(null=True)
    etablissements_sphere_presentielle_public = models.FloatField(null=True)
    etablissements_sphere_productive_public = models.FloatField(null=True)
    effectifs_sphere_presentielle = models.FloatField(null=True)
    effectifs_sphere_productive = models.FloatField(null=True)
    effectifs_sphere_presentielle_public = models.FloatField(null=True)
    effectifs_sphere_productive_public = models.FloatField(null=True)
    particuliers_employeurs_assistants_maternels = models.FloatField(null=True)
    particuliers_employeurs_autres = models.FloatField(null=True)

    class Meta:
        managed = False
        db_table = "public_data_dc_etablissements"
