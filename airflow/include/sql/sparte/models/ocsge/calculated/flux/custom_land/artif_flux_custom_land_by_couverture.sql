{{
    config(
        materialized="table",
        indexes=[{"columns": ["code"], "type": "btree"}],
    )
}}

SELECT
    clc.custom_land_id as code,
    couverture,
    flux_table.year_old,
    flux_table.year_new,
    flux_table.year_old_index,
    flux_table.year_new_index,
    sum(flux_table.flux_artif) as flux_artif,
    sum(flux_table.flux_desartif) as flux_desartif,
    sum(flux_table.flux_artif_net) as flux_artif_net,
    commune.departement
FROM
    {{ ref('artif_flux_commune_by_couverture') }} as flux_table
INNER JOIN
    {{ ref('commune_custom_land') }} clc
    ON flux_table.commune_code = clc.commune_code
LEFT JOIN
    {{ ref('commune') }}
    ON flux_table.commune_code = commune.code
WHERE
    clc.custom_land_id IS NOT NULL
GROUP BY
    clc.custom_land_id,
    couverture,
    flux_table.year_old,
    flux_table.year_new,
    flux_table.year_old_index,
    flux_table.year_new_index,
    commune.departement
