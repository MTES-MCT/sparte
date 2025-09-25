{% macro merge_imper_commune_flux_by_sol_and_admin_level(group_by_column, sol) %}


with without_percent as (
SELECT
    commune.{{ group_by_column }} as code,
    year_old,
    year_new,
    year_old_index,
    year_new_index,
    {{ sol }},
    sum(imper_flux_commune_by_{{ sol }}.flux_imper) as flux_imper,
    sum(imper_flux_commune_by_{{ sol }}.flux_desimper) as flux_desimper,
    sum(imper_flux_commune_by_{{ sol }}.flux_imper_net) as flux_imper_net,
    sum(commune.surface) as surface,
    commune.departement
 FROM
    {{ ref('imper_flux_commune_by_' + sol) }}
LEFT JOIN
    {{ ref('commune') }}
    ON imper_flux_commune_by_{{ sol }}.commune_code = commune.code
WHERE
    commune.{{ group_by_column }} IS NOT NULL
GROUP BY
    commune.{{ group_by_column }}, {{ sol }}, year_old, year_new, commune.departement, year_old_index, year_new_index
)
SELECT
    without_percent.code,
    without_percent.departement,
    without_percent.surface as land_surface,
    without_percent.year_old,
    without_percent.year_new,
    without_percent.year_old_index,
    without_percent.year_new_index,
    without_percent.{{ sol }},
    without_percent.flux_imper as flux_imper,
    without_percent.flux_desimper as flux_desimper,
    without_percent.flux_imper_net as flux_imper_net
 FROM
    without_percent
ORDER BY
    code
{% endmacro %}
