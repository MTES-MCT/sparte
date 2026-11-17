{#-
    Années de consommation portées par le carroyage de la carte nationale (colonnes
    `conso_AAAA`). Une seule définition pour le modèle `for_vector_tiles_carroyage_national`
    et pour ses tests : ajouter un millésime ne se fait qu'ici (et dans le modèle parent
    `for_vector_tiles_carroyage_lea`, qui doit fournir la colonne).
-#}
{% macro carroyage_national_years() %}
    {{ return(range(2011, 2025) | list) }}
{% endmacro %}
