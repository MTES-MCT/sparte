{#-
    Destinations de la consommation d'espaces portées par le carroyage du Cerema, dans l'ordre
    des colonnes de la source (`conso_AAAA_<destination>` de `for_vector_tiles_carroyage_lea`).
    Chacune a son modèle `for_vector_tiles_carroyage_national_<destination>` et son fichier de
    tuiles `carroyage_national_<destination>.pmtiles`.

    Une seule définition pour ces modèles et pour leurs tests. Le DAG
    `create_carroyage_national_vector_tiles` tient la même liste (`DESTINATIONS`) : un test
    pytest compare les deux.
-#}
{% macro carroyage_national_destinations() %}
    {{ return(['habitat', 'activite', 'mixte', 'route', 'ferroviaire', 'inconnu']) }}
{% endmacro %}
