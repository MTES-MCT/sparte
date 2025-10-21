{% macro merge_artif_commune_flux_by_admin_level(group_by_column) %}

with without_percent as (
SELECT
    commune.{{ group_by_column }} as code,
    year_old,
    year_old_index,
    year_new,
    year_new_index,
    sum(artif_commune.flux_artif) as flux_artif,
    sum(artif_commune.flux_desartif) as flux_desartif,
    sum(commune.surface) as surface,
    commune.departement
 FROM
    {{ ref('artif_net_flux_commune') }} as artif_commune
LEFT JOIN
    {{ ref('commune') }}
    ON artif_commune.commune_code = commune.code
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
    without_percent.flux_artif as flux_artif,
    without_percent.flux_desartif as flux_desartif,
    without_percent.flux_artif - without_percent.flux_desartif as flux_artif_net
 FROM without_percent

{% endmacro %}
