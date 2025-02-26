{% macro merge_imper_commune_flux_by_sol_and_admin_level(group_by_column, sol) %}

-- TODO : test


with without_percent as (
SELECT
    {{ group_by_column }},
    year_old,
    year_new,
    {{ sol }},
    sum(imper_flux_commune_by_{{ sol }}.flux_imper) as flux_imper,
    sum(imper_flux_commune_by_{{ sol }}.flux_desimper) as flux_desimper,
    sum(commune.surface) as surface,
    array_agg(distinct commune.departement) as departements
 FROM
    {{ ref('imper_flux_commune_by_' + sol) }}
LEFT JOIN
    {{ ref('commune') }}
    ON imper_flux_commune_by_{{ sol }}.commune_code = commune.code
WHERE
    {{ group_by_column }} IS NOT NULL
GROUP BY
    {{ group_by_column }}, {{ sol }}, year_old, year_new
)
SELECt
    without_percent.{{ group_by_column }},
    without_percent.departements,
    without_percent.surface as {{ group_by_column }}_surface,
    without_percent.year_old,
    without_percent.year_new,
    without_percent.{{ sol }},
    without_percent.flux_imper as flux_imper,
    without_percent.flux_desimper as flux_desimper
 FROM
    without_percent
{% endmacro %}
