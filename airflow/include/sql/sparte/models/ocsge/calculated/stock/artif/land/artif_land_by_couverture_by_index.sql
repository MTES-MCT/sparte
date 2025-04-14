
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
    couverture,
    array_agg(distinct year) as years,
    array_agg(distinct departement) as departements,
    sum(artificial_surface) as artificial_surface


FROM {{ ref('artif_land_by_couverture')}}
GROUP BY land_id, land_type, index, couverture
)
SELECT
    without_percent.*,
    without_percent.artificial_surface / land.surface * 100 as percent_of_land,
    without_percent.artificial_surface / artif_land_by_index.artificial_surface * 100 as percent_of_artif
FROM without_percent
LEFT JOIN
    {{ ref('land')}}
ON land.land_id = without_percent.land_id
    AND land.land_type = without_percent.land_type
LEFT JOIN
    {{ ref('artif_land_by_index') }}
ON land.land_id = artif_land_by_index.land_id
    AND land.land_type = artif_land_by_index.land_type
    AND without_percent.index = artif_land_by_index.index
