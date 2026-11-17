{#-
    Carré d'une maille du carroyage des sols artificialisés, dans la projection d'origine de
    son territoire.

    Paramètres : expressions SQL de la colonne et de la ligne de la maille (coordonnées de son
    coin sud-ouest divisées par son côté), de son côté en mètres et de sa projection.
-#}
{% macro carroyage_artif_block_envelope(x, y, resolution_m, srid) -%}
ST_MakeEnvelope(
    ({{ x }}) * ({{ resolution_m }}),
    ({{ y }}) * ({{ resolution_m }}),
    (({{ x }}) + 1) * ({{ resolution_m }}),
    (({{ y }}) + 1) * ({{ resolution_m }}),
    {{ srid }}
)
{%- endmacro %}
