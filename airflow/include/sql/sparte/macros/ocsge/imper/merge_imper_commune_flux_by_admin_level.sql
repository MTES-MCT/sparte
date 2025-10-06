{% macro merge_imper_commune_flux_by_admin_level(group_by_column) %}

with without_percent as (
SELECT
    commune.{{ group_by_column }} as code,
    year_old,
    year_old_index,
    year_new,
    year_new_index,
    sum(imper_commune.flux_imper) as flux_imper,
    sum(imper_commune.flux_desimper) as flux_desimper,
    sum(commune.surface) as surface,
    commune.departement
 FROM
    {{ ref('imper_net_flux_commune') }} as imper_commune
LEFT JOIN
    {{ ref('commune') }}
    ON imper_commune.commune_code = commune.code
WHERE
    commune.{{ group_by_column }} IS NOT NULL
GROUP BY
    commune.{{ group_by_column }}, year_old, year_new, year_old_index, year_new_index, commune.departement
)
SELECT
    without_percent.code,
    without_percent.departement,
    without_percent.surface as surface,
    without_percent.year_old,
    without_percent.year_new,
    without_percent.year_old_index,
    without_percent.year_new_index,
    without_percent.flux_imper as flux_imper,
    without_percent.flux_desimper as flux_desimper,
    without_percent.flux_imper - without_percent.flux_desimper as flux_imper_net
 FROM without_percent

{% endmacro %}
