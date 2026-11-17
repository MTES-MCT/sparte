{% macro national_map_apply_drom_placement(geometry, placement) -%}
{#-
    Déplace une géométrie d'outre-mer dans le cartouche de sa région : mise à l'échelle de
    l'Hexagone puis translation, sans rotation ni autre déformation.

    Paramètres :
        - geometry : expression SQL d'une géométrie en EPSG:3857 ;
        - placement : alias de la ligne de `national_map_drom_placement` de sa région.
-#}
ST_Affine(
    {{ geometry }},
    {{ placement }}.scale_factor, 0,
    0, {{ placement }}.scale_factor,
    {{ placement }}.x_offset, {{ placement }}.y_offset
)
{%- endmacro %}
