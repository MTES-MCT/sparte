
{{
    config(
        materialized="table",
        indexes=[
            {"columns": ["land_id"], "type": "btree"},
            {"columns": ["land_type"], "type": "btree"},
            {"columns": ["index"], "type": "btree"},
        ],
    )
}}


with without_percent as (
SELECT
    land_id,
    land_type,
    index,
    array_agg(distinct year) as years,
    array_agg(distinct departement) as departements,
    sum(surface) as surface,
    sum(land_surface) as land_surface,
    sum(flux_surface) as flux_surface,
    array_agg(distinct flux_previous_year) as flux_previous_years
FROM {{ ref('artif_land')}}
GROUP BY land_id, land_type, index
), without_flux_percent as (
SELECT
    *,
    surface / land_surface * 100 as percent
FROM without_percent
)
SELECT
    land_id,
    land_type,
    index,
    years,
    departements,
    land_surface,
    surface,
    percent,
    flux_surface,
    flux.flux_percent as flux_percent,
    flux_previous_years
FROM without_flux_percent as wfp
LEFT JOIN LATERAL (
    SELECT wfp.percent - a.percent as flux_percent
    FROM
        without_flux_percent as a
    WHERE
        a.land_id = wfp.land_id AND
        a.land_type = wfp.land_type AND
        a.index = wfp.index - 1
) flux ON true
