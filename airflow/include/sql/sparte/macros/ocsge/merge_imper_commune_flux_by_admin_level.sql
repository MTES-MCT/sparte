{% macro merge_imper_commune_flux_by_admin_level(group_by_column) %}

with without_percent as (
SELECT
    commune.{{ group_by_column }},
    year_old,
    year_new,
    sum(imper_commune.flux_imper) as flux_imper,
    sum(imper_commune.flux_desimper) as flux_desimper,
    sum(commune.surface) as surface,
    array_agg(distinct commune.departement) as departements
 FROM
    {{ ref('imper_net_flux_commune') }} as imper_commune
LEFT JOIN
    {{ ref('commune') }}
    ON imper_commune.commune_code = commune.code
WHERE
    commune.{{ group_by_column }} IS NOT NULL
GROUP BY
    commune.{{ group_by_column }}, year_old, year_new
)
SELECt
    without_percent.{{ group_by_column }},
    without_percent.departements,
    without_percent.surface as {{ group_by_column }}_surface,
    without_percent.year_old,
    without_percent.year_new,
    without_percent.flux_imper as flux_imper,
    without_percent.flux_desimper as flux_desimper,
    without_percent.flux_imper - without_percent.flux_desimper as flux_imper_net
 FROM without_percent

{% endmacro %}
