{#-
    Résolutions empilées dans le carroyage de la carte nationale : le côté, en km, des carreaux
    (1 : ceux d'origine) et des blocs qui les regroupent. Une seule définition pour le modèle
    `for_vector_tiles_carroyage_national` et pour ses tests.

    Chaque résolution doit recevoir une plage de zooms dans le DAG
    `create_carroyage_national_vector_tiles` (`ZOOMS_BY_RESOLUTION_KM`) : un test pytest
    compare les deux listes.
-#}
{% macro carroyage_national_resolutions_km() %}
    {{ return([1, 2, 5]) }}
{% endmacro %}
