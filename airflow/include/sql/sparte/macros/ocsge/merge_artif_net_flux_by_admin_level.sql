{% macro merge_artif_net_flux_by_admin_level(group_by_column) %}


with without_percent as (
SELECT
    {{ group_by_column }},
    year_old,
    year_new,
    sum(artif_net_flux_commune.artificial_surface) as artificial_surface,
    sum(artif_net_flux_commune.desartif_surface) as desartif_surface,
    sum(commune.surface) as surface,
    array_agg(distinct commune.departement) as departements
 FROM
    {{ ref('artif_net_flux_commune') }}
LEFT JOIN
    {{ ref('commune') }}
    ON artif_net_flux_commune.commune_code = commune.code
WHERE
    {{ group_by_column }} IS NOT NULL
GROUP BY
    {{ group_by_column }}, year_old, year_new
)
SELECt
    *
 FROM without_percent


{% endmacro %}
