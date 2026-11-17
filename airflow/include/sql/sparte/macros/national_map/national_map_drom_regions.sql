{% macro national_map_drom_regions() %}
    {#-
        Régions d'outre-mer que la carte nationale déplace près de l'Hexagone : code de la
        région -> nom affiché sur son cartouche.

        Même liste que `DROM` dans public_data/domain/national_map.py.
    -#}
    {{ return({
        "01": "Guadeloupe",
        "02": "Martinique",
        "03": "Guyane",
        "04": "La Réunion",
        "06": "Mayotte",
    }) }}
{% endmacro %}
