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
    year_old_index,
    year_new,
    year_new_index,
    sum(artif_commune.flux_artif) as flux_artif,
    sum(artif_commune.flux_desartif) as flux_desartif,
    sum(commune.surface) as surface,
    commune.departement
FROM
    {{ ref('artif_net_flux_commune') }} as artif_commune
INNER JOIN
    {{ ref('commune_custom_land') }} clc
    ON artif_commune.commune_code = clc.commune_code
LEFT JOIN
    {{ ref('commune') }}
    ON artif_commune.commune_code = commune.code
WHERE
    clc.custom_land_id IS NOT NULL
GROUP BY
    clc.custom_land_id, year_old, year_new, year_old_index, year_new_index, commune.departement
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
