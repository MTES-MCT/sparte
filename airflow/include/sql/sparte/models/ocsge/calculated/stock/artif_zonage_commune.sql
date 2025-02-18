{{
    config(
        materialized="table",
        indexes=[
            {"columns": ["commune"], "type": "btree"},
            {"columns": ["departement"], "type": "btree"},
            {"columns": ["region"], "type": "btree"},
            {"columns": ["epci"], "type": "btree"},
            {"columns": ["ept"], "type": "btree"},
            {"columns": ["scot"], "type": "btree"},
        ],
    )
}}


with
    without_percent as (
        select
            commune,
            departement,
            region,
            epci,
            ept,
            scot,
            count(distinct land_zonage.zonage_checksum)::integer as zonage_count,
            sum(zonage_couverture_et_usage.surface) as surface,
            sum(
                case
                    zonage_couverture_et_usage.is_artificial
                    when true
                    then zonage_couverture_et_usage.surface
                    else 0
                end
            ) as artificial_surface,
            zonage_type,
            year
        from {{ ref("commune_zonage") }} as land_zonage
        left join
            {{ ref("zonage_couverture_et_usage") }}
            on land_zonage.zonage_checksum = zonage_couverture_et_usage.zonage_checksum
        where zonage_type is not null
        group by commune, zonage_type, year, departement, region, epci, ept, scot
    )
select
    commune,
    departement,
    region,
    epci,
    ept,
    scot,
    year,
    surface,
    artificial_surface,
    zonage_type,
    zonage_count,
    artificial_surface / surface * 100 as artificial_percent
from without_percent
