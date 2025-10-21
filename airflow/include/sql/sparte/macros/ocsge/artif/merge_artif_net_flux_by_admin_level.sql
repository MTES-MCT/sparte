{% macro merge_artif_net_flux_by_admin_level(group_by_column) %}


with without_percent as (
SELECT
    commune.{{ group_by_column }} as code,
    year_old,
    year_new,
    year_old_index,
    year_new_index,
    sum(artif_net_flux_commune.flux_artif) as flux_artif,
    sum(artif_net_flux_commune.flux_desartif) as flux_desartif,
    sum(commune.surface) as surface,
    commune.departement
 FROM
    {{ ref('artif_net_flux_commune') }}
LEFT JOIN
    {{ ref('commune') }}
    ON artif_net_flux_commune.commune_code = commune.code
WHERE
    commune.{{ group_by_column }} IS NOT NULL
GROUP BY
    commune.{{ group_by_column }}, year_old, year_new, year_old_index, year_new_index, commune.departement
)
SELECT
    *,
    flux_artif - flux_desartif as flux_artif_net
 FROM without_percent


{% endmacro %}
