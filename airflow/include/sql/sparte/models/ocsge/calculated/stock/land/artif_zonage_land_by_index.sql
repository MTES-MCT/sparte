
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
    land_type,
    land_id,
    array_agg(distinct year) as years,
    array_agg(distinct departement) as departements,
    index,
    sum(zonage_surface) as zonage_surface,
    sum(indicateur_surface) as indicateur_surface,
    zonage_type,
    sum(zonage_count) as zonage_count
FROM
    {{ ref('artif_zonage_land')}}
GROUP BY
    land_type, land_id, index, zonage_type
)
SELECT
    without_percent.*,
    indicateur_surface * 100 / zonage_surface  as percent_of_zonage
FROM
    without_percent
