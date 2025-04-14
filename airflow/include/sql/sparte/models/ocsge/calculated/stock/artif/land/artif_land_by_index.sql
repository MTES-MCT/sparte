
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
    sum(artificial_surface) as artificial_surface,
    sum(surface) as surface
FROM {{ ref('artif_land')}}
GROUP BY land_id, land_type, index
)
SELECT
    *,
    artificial_surface / surface * 100 as percent
FROM without_percent
