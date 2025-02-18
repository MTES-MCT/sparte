{{
    config(
        materialized="table",
        indexes=[
            {"columns": ["departement"], "type": "btree"},
            {"columns": ["year"], "type": "btree"},
            {"columns": ["uuid"], "type": "btree"},
            {"columns": ["zonage_checksum"], "type": "btree"},
            {"columns": ["ocsge_loaded_date"], "type": "btree"},
            {"columns": ["zonage_gpu_timestamp"], "type": "btree"},
            {"columns": ["geom"], "type": "gist"},
        ],
    )
}}

with
    occupation_du_sol_zonage_urbanisme_without_surface as (
        select
            concat(ocsge.uuid::text, '_', zonage.checksum::text) as ocsge_zonage_id,  -- surrogate key
            -- les attributs spécifiques aux zonages sont préfixés par zonage_
            zonage.libelle as zonage_libelle,
            zonage.checksum as zonage_checksum,
            zonage.gpu_timestamp as zonage_gpu_timestamp,
            zonage.surface as zonage_surface,
            zonage.type_zone as zonage_type,
            -- les attributs spécifiques aux objets OCS GE sont préfixés par ocsge_
            ocsge.loaded_date as ocsge_loaded_date,
            -- les attributs communs aux deux tables sont sans préfixe
            ocsge.year,
            ocsge.departement,
            ocsge.code_cs,
            ocsge.code_us,
            ocsge.uuid,
            ocsge.is_artificial,
            ocsge.is_impermeable,
            ocsge.srid_source,
            (st_dump(st_intersection(zonage.geom, ocsge.geom))).geom as geom
        from {{ ref("zonage_urbanisme") }} as zonage
        inner join
            {{ ref("occupation_du_sol") }} as ocsge
            on zonage.srid_source = ocsge.srid_source
            and zonage.departement = ocsge.departement
            and zonage.geom && ocsge.geom
            and st_intersects(zonage.geom, ocsge.geom)

    ),
    occupation_du_sol_zonage_urbanisme_without_surface_with_duplicates_marked as (
        select *, row_number() over (partition by geom, year, departement) as rn
        from occupation_du_sol_zonage_urbanisme_without_surface
    )
select *, st_area(geom) as surface
from occupation_du_sol_zonage_urbanisme_without_surface_with_duplicates_marked
where rn = 1
