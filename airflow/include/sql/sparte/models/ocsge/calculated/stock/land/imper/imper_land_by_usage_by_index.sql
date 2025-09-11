
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
    usage,
    array_agg(distinct year) as years,
    array_agg(distinct departement) as departements,
    sum(surface) as surface


FROM {{ ref('imper_land_by_usage')}}
GROUP BY land_id, land_type, index, usage
)
SELECT
    without_percent.*,
    without_percent.surface / land.surface * 100 as percent_of_land,
    without_percent.surface / imper_land_by_index.surface * 100 as percent_of_indicateur
FROM without_percent
LEFT JOIN
    {{ ref('land')}}
ON land.land_id = without_percent.land_id
    AND land.land_type = without_percent.land_type
LEFT JOIN
    {{ ref('imper_land_by_index') }}
ON land.land_id = imper_land_by_index.land_id
    AND land.land_type = imper_land_by_index.land_type
    AND without_percent.index = imper_land_by_index.index
