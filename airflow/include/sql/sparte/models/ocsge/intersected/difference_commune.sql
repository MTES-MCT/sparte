{{
    config(
        materialized="table",
        indexes=[{"columns": ["ocsge_loaded_date"], "type": "btree"}],
    )
}}

/*

Cette requête découpe les objets OCS GE de différence par commune.

Dans le cas où un objet OCS GE est découpé par plusieurs communes,
il sera dupliqué, mais la surface totale de l'objet sera conservée.

*/
with
    difference_commune_without_surface as (
        select
            -- surrogate key
            commune.code as commune_code,
            commune.surface as commune_surface,
            -- les attributs spécifiques aux communes sont préfixés par commune_
            ocsge.loaded_date as ocsge_loaded_date,
            -- les attributs spécifiques aux objets OCS GE sont préfixés par ocsge_
            ocsge.uuid as ocsge_uuid,
            ocsge.year_old,
            -- les attributs communs aux deux tables sont sans préfixe
            ocsge.year_new,
            ocsge.departement,
            ocsge.new_is_impermeable,
            ocsge.new_not_impermeable,
            ocsge.cs_old,
            ocsge.us_old,
            ocsge.cs_new,
            ocsge.us_new,
            ocsge.srid_source,
            concat(ocsge.uuid::text, '_', commune.code::text) as ocsge_commune_id,
            (st_dump(st_intersection(commune.geom, ocsge.geom))).geom as geom
        from {{ ref("commune") }} as commune
        inner join
            {{ ref("difference") }} as ocsge
            on commune.departement = ocsge.departement
            and commune.srid_source = ocsge.srid_source
            and commune.geom && ocsge.geom
            and st_intersects(commune.geom, ocsge.geom)
    )

select *, st_area(geom) as surface
from difference_commune_without_surface
