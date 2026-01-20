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
    sum(imper_net_flux_commune.flux_imper) as flux_imper,
    sum(imper_net_flux_commune.flux_desimper) as flux_desimper,
    sum(commune.surface) as surface,
    commune.departement
FROM
    {{ ref('imper_net_flux_commune') }}
INNER JOIN
    {{ ref('commune_custom_land') }} clc
    ON imper_net_flux_commune.commune_code = clc.commune_code
LEFT JOIN
    {{ ref('commune') }}
    ON imper_net_flux_commune.commune_code = commune.code
WHERE
    clc.custom_land_id IS NOT NULL
GROUP BY
    clc.custom_land_id, year_old, year_new, year_old_index, year_new_index, commune.departement
)
SELECT
    *,
    flux_imper - flux_desimper as flux_imper_net
FROM without_percent
