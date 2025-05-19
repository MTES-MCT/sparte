{% macro merge_imper_net_flux_by_admin_level(group_by_column) %}


with without_percent as (
SELECT
    {{ group_by_column }},
    year_old,
    year_new,
    sum(imper_net_flux_commune.flux_imper) as flux_imper,
    sum(imper_net_flux_commune.flux_desimper) as flux_desimper,
    sum(commune.surface) as surface,
    array_agg(distinct commune.departement) as departements
 FROM
    {{ ref('imper_net_flux_commune') }}
LEFT JOIN
    {{ ref('commune') }}
    ON imper_net_flux_commune.commune_code = commune.code
WHERE
    {{ group_by_column }} IS NOT NULL
GROUP BY
    {{ group_by_column }}, year_old, year_new
)
SELECt
    *,
    flux_imper - flux_desimper as flux_imper_net
 FROM without_percent


{% endmacro %}
