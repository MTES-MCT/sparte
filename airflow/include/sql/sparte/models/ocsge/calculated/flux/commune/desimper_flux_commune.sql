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
    sum(surface) as flux_desimper
FROM
    {{ ref('commune_flux_couverture_et_usage')}}
WHERE
    new_not_impermeable
group by
    commune_code, commune_surface,  year_old, year_new, year_old_index, year_new_index
)
SELECT
   without_percent.*,
    flux_desimper / commune_surface * 100 as flux_desimper_percent
FROM
    without_percent
