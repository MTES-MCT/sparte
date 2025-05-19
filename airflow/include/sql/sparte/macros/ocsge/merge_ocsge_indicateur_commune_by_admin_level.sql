{% macro merge_ocsge_indicateur_commune_by_admin_level(indicateur, group_by_column) %}

{% set indicateur_table = indicateur + '_commune' %}

with without_percent as (
SELECT
    {{ group_by_column }} as code,
    {{ indicateur_table }}.year,
    sum({{ indicateur_table }}.surface) as surface,
    sum({{ indicateur_table }}.land_surface) as land_surface,
    {{ indicateur_table }}.departement as departement,
    {{ indicateur_table }}.index as index
 FROM
    {{ ref(indicateur_table) }}
LEFT JOIN
    {{ ref('commune') }}
    ON {{ indicateur_table }}.code = commune.code
WHERE
    {{ group_by_column }} IS NOT NULL
GROUP BY
    {{ group_by_column }}, year, {{ indicateur_table }}.departement, {{ indicateur_table }}.index
)
SELECt
    *,
    surface / land_surface * 100 as percent
 FROM without_percent

{% endmacro %}
