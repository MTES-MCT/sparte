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
    usage,
    sum(imper_flux_commune_by_usage.flux_imper) as flux_imper,
    sum(imper_flux_commune_by_usage.flux_desimper) as flux_desimper,
    sum(imper_flux_commune_by_usage.flux_imper_net) as flux_imper_net,
    sum(commune.surface) as surface,
    commune.departement
FROM
    {{ ref('imper_flux_commune_by_usage') }}
INNER JOIN
    {{ ref('commune_custom_land') }} clc
    ON imper_flux_commune_by_usage.commune_code = clc.commune_code
LEFT JOIN
    {{ ref('commune') }}
    ON imper_flux_commune_by_usage.commune_code = commune.code
WHERE
    clc.custom_land_id IS NOT NULL
GROUP BY
    clc.custom_land_id, usage, year_old, year_new, year_old_index, year_new_index, commune.departement
)
SELECT
    without_percent.code,
    without_percent.departement,
    without_percent.surface as land_surface,
    without_percent.year_old,
    without_percent.year_new,
    without_percent.year_old_index,
    without_percent.year_new_index,
    without_percent.usage,
    without_percent.flux_imper as flux_imper,
    without_percent.flux_desimper as flux_desimper,
    without_percent.flux_imper_net as flux_imper_net
FROM
    without_percent
ORDER BY
    code
