
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
    sum(land_surface) as land_surface
FROM {{ ref('artif_land')}}
GROUP BY land_id, land_type, index
)
SELECT
    *,
    surface / land_surface * 100 as percent
FROM without_percent
