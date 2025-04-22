{% macro merge_ocsge_indicateur_commune_by_sol_and_admin_level(indicateur, group_by_column, sol) %}

{% set sol_table = indicateur + '_commune_by_' + sol %}
{% set indicateur_table = indicateur + '_' + group_by_column %}


with without_percent as (
    SELECT
        commune.{{ group_by_column }} as code,
        year,
        {{ sol }},
        sum({{ sol_table }}.surface) as surface,
        sum(commune.surface) as land_surface,
        commune.departement as departement,
        {{ sol_table }}.index as index
    FROM
        {{ ref(sol_table) }}
    LEFT JOIN
        {{ ref('commune') }}
        ON {{ sol_table }}.code = commune.code
    WHERE
        commune.{{ group_by_column }} IS NOT NULL
    GROUP BY
        commune.{{ group_by_column }}, {{ sol }}, year, commune.departement, {{ sol_table }}.index
)
SELECt
    without_percent.code,
    without_percent.departement,
    without_percent.index,
    without_percent.year,
    without_percent.surface / without_percent.land_surface * 100 as percent_of_land,
    without_percent.surface as surface,
    without_percent.{{ sol }},
    (100 * without_percent.surface) / {{ indicateur_table }}.surface as percent_of_indicateur
 FROM without_percent
 LEFT JOIN
    {{ ref(indicateur_table) }} as {{ indicateur_table }}
    ON without_percent.code = {{ indicateur_table }}.code
    AND without_percent.year = {{ indicateur_table }}.year
    AND without_percent.departement = {{ indicateur_table }}.departement


{% endmacro %}
