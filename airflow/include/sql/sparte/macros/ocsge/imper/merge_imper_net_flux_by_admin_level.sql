{% macro merge_imper_net_flux_by_admin_level(group_by_column) %}


with without_percent as (
SELECT
    commune.{{ group_by_column }} as code,
    year_old,
    year_new,
    year_old_index,
    year_new_index,
    sum(imper_net_flux_commune.flux_imper) as flux_imper,
    sum(imper_net_flux_commune.flux_desimper) as flux_desimper,
    sum(commune.surface) as surface,
    commune.departement
 FROM
    {{ ref('imper_net_flux_commune') }}
LEFT JOIN
    {{ ref('commune') }}
    ON imper_net_flux_commune.commune_code = commune.code
WHERE
    commune.{{ group_by_column }} IS NOT NULL
GROUP BY
    commune.{{ group_by_column }}, year_old, year_new, year_old_index, year_new_index, commune.departement
)
SELECT
    *,
    flux_imper - flux_desimper as flux_imper_net
 FROM without_percent


{% endmacro %}
