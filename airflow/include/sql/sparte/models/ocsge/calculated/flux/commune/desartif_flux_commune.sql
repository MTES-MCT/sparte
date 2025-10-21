{{
    config(
        materialized="table",
        indexes=[{"columns": ["commune_code"], "type": "btree"}],
    )
}}

with without_percent as (
SELECT
    commune_code,
    commune_surface,
    year_old,
    year_new,
    year_old_index,
    year_new_index,
    sum(surface) as flux_desartif
FROM
    {{ ref('commune_flux_couverture_et_usage_artif')}}
WHERE
    new_not_artificial
group by
    commune_code, commune_surface,  year_old, year_new, year_old_index, year_new_index
)
SELECT
   without_percent.*,
    flux_desartif / commune_surface * 100 as flux_desartif_percent
FROM
    without_percent
