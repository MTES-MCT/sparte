{{
    config(materialized="table")
}}
select
    zonage.*,
    round(st_area(geom)::numeric, 4) as surface
FROM
    {{ ref("4_zonage_urbanisme_deduplicated") }} as zonage
