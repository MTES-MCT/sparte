{% macro merge_imper_net_flux_by_admin_level(group_by_column) %}


with without_percent as (
SELECT
    {{ group_by_column }},
    year_old,
    year_new,
    sum(imper_net_flux_commune.impermeable_surface) as impermeable_surface,
    sum(imper_net_flux_commune.desimper_surface) as desimper_surface,
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
    impermeable_surface - desimper_surface as imper_net
 FROM without_percent


{% endmacro %}
