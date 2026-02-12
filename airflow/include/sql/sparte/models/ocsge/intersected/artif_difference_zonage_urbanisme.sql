{{
    config(
        materialized="table",
        indexes=[
            {"columns": ["zonage_checksum"], "type": "btree"},
            {"columns": ["year_old"], "type": "btree"},
            {"columns": ["year_new"], "type": "btree"},
            {"columns": ["departement"], "type": "btree"},
            {"columns": ["geom"], "type": "gist"},
        ],
    )
}}

/*

Cette requête découpe les objets OCS GE de différence d'artificialisation par zonage d'urbanisme.

Dans le cas où un objet OCS GE chevauche plusieurs zonages,
il sera découpé et la surface recalculée pour chaque intersection.

*/
with
    difference_zonage_without_surface as (
        select
            zonage.checksum as zonage_checksum,
            zonage.surface as zonage_surface,
            ocsge.loaded_date as ocsge_loaded_date,
            ocsge.uuid as ocsge_uuid,
            ocsge.year_old,
            ocsge.year_new,
            ocsge.year_old_index,
            ocsge.year_new_index,
            ocsge.departement,
            ocsge.new_is_artificial,
            ocsge.new_not_artificial,
            ocsge.cs_old,
            ocsge.us_old,
            ocsge.cs_new,
            ocsge.us_new,
            ocsge.srid_source,
            (st_dump(st_intersection(zonage.geom, ocsge.geom))).geom as geom
        from {{ ref("zonage_urbanisme") }} as zonage
        inner join
            {{ ref("artif_difference") }} as ocsge
            on zonage.departement = ocsge.departement
            and zonage.srid_source = ocsge.srid_source
            and zonage.geom && ocsge.geom
            and st_intersects(zonage.geom, ocsge.geom)
    )

select *, st_area(geom) as surface
from difference_zonage_without_surface
