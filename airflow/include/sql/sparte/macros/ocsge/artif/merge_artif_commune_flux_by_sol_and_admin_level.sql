{% macro merge_artif_commune_flux_by_sol_and_admin_level(sol, group_by_column) %}

{% set flux_table = "artif_flux_commune_by_" + sol %}

SELECT
    commune.{{ group_by_column }} as code,
    {{ sol }},
    flux_table.year_old,
    flux_table.year_new,
    flux_table.year_old_index,
    flux_table.year_new_index,
    sum(flux_table.flux_artif) as flux_artif,
    sum(flux_table.flux_desartif) as flux_desartif,
    sum(flux_table.flux_artif_net) as flux_artif_net,
    commune.departement
 FROM
    {{ ref(flux_table) }} as flux_table
LEFT JOIN
    {{ ref('commune') }}
    ON flux_table.commune_code = commune.code
WHERE
    commune.{{ group_by_column }} IS NOT NULL
GROUP BY
    commune.{{ group_by_column }},
    {{ sol }},
    flux_table.year_old,
    flux_table.year_new,
    flux_table.year_old_index,
    flux_table.year_new_index,
    commune.departement

{% endmacro %}
