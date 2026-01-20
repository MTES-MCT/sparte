{{
    config(
        materialized="table",
        indexes=[{"columns": ["code"], "type": "btree"}],
    )
}}

with without_percent as (
SELECT
    clc.custom_land_id as code,
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
INNER JOIN
    {{ ref('commune_custom_land') }} clc
    ON artif_net_flux_commune.commune_code = clc.commune_code
LEFT JOIN
    {{ ref('commune') }}
    ON artif_net_flux_commune.commune_code = commune.code
WHERE
    clc.custom_land_id IS NOT NULL
GROUP BY
    clc.custom_land_id, year_old, year_new, year_old_index, year_new_index, commune.departement
)
SELECT
    *,
    flux_artif - flux_desartif as flux_artif_net
FROM without_percent
