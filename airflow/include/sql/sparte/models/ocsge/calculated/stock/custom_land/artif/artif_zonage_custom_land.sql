{{
    config(
        materialized="table",
        indexes=[
            {"columns": ["code"], "type": "btree"},
        ],
    )
}}

with without_percent as (
    select
        clc.custom_land_id as code,
        year,
        index,
        artif_zonage_commune.departement,
        sum(zonage_surface) as zonage_surface,
        sum(indicateur_surface) as indicateur_surface,
        zonage_type,
        sum(zonage_count) as zonage_count
    from {{ ref('artif_zonage_commune') }}
    INNER JOIN
        {{ ref('commune_custom_land') }} clc
        ON artif_zonage_commune.code = clc.commune_code
    WHERE
        clc.custom_land_id IS NOT NULL
    group by clc.custom_land_id, year, index, zonage_type, artif_zonage_commune.departement
)
select
    code,
    year,
    index,
    departement,
    zonage_surface,
    indicateur_surface,
    indicateur_surface / zonage_surface * 100 as indicateur_percent,
    zonage_type,
    zonage_count
from without_percent
