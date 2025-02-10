{{
    config(
        materialized="table",
        indexes=[
            {"columns": ["loaded_date"], "type": "btree"},
            {"columns": ["departement", "year"], "type": "btree"},
            {"columns": ["departement"], "type": "btree"},
            {"columns": ["uuid"], "type": "btree"},
            {"columns": ["geom"], "type": "gist"},
            {"columns": ["srid_source"], "type": "btree"},
        ],
    )
}}
with
    zone_construite_with_duplicates as (
        select
            zc.id,
            zc.year,
            zc.departement,
            zc.uuid::uuid,
            departement_table.srid_source as srid_source,
            to_timestamp(zc.loaded_date) as loaded_date,
            (
                st_dump(st_intersection(departement_table.geom, st_makevalid(zc.geom)))
            ).geom as geom
        from {{ source("public", "ocsge_zone_construite") }} as zc
        left join
            {{ ref("departement") }} as departement_table
            on departement = departement_table.code
    ),
    zone_construite_without_duplicates as (
        select *, row_number() over (partition by geom, year, departement) as rn
        from zone_construite_with_duplicates
    )
select
    id,
    year,
    departement,
    uuid,
    srid_source,
    loaded_date,
    geom,
    st_area(geom) as surface
from zone_construite_without_duplicates
where rn = 1
