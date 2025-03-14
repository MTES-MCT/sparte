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
    sum(surface) as desartif_surface
FROM
    {{ ref('commune_flux_couverture_et_usage')}}
WHERE
    new_not_artificial
group by
    commune_code, commune_surface,  year_old, year_new
)
SELECT
   without_percent.*,
    desartif_surface / commune_surface * 100 as percent
FROM
    without_percent
