from rest_framework_gis import serializers

from .models import CommunesSybarval


class CommunesSybarvalSerializer(serializers.GeoFeatureModelSerializer):
    """Marker GeoJSON serializer."""

    class Meta:
        """Marker serializer meta class."""

        fields = (
            "id_source",
            "prec_plani",
            "nom",
            "code_insee",
            "statut",
            "arrondisst",
            "depart",
            "region",
            "pop_2014",
            "pop_2015",
            "_commune",
            "_n_arrdt",
            "_n_canton",
            "_nom_epci",
            "_siren_epc",
            "_nom_scot",
            "surface",
            "a_brute_20",
            "a_b_2015_2",
            "a_b_2018_2",
            "z_baties_2",
            "voirie_201",
            "tache_2018",
            "d_brute_20",
            "d_batie_20",
            "d_voirie_2",
        )
        geo_field = "mpoly"
        model = CommunesSybarval
