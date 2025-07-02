{{
    config(
        materialized="table",
        indexes=[
            {"columns": ["departement"], "type": "btree"},
            {"columns": ["year"], "type": "btree"},
            {"columns": ["friche_site_id"], "type": "btree"},
            {"columns": ["ocsge_uuid"], "type": "btree"},
            {"columns": ["geom"], "type": "gist"},
            {"columns": ["ocsge_loaded_date"], "type": "btree"},
        ],
    )
}}

/*

Cette requête découpe les objets OCS GE d'occupation du sol par friche.

Dans le cas où un objet OCS GE est découpé par plusieurs friches, il sera dupliqué, mais
la surface totale de l'objet sera conservée.

*/
with
    occupation_du_sol_friche_without_surface as (
        select
            concat(ocsge.uuid::text, '_', friche.site_id::text) as ocsge_friche_id,  -- surrogate key
            -- les attributs spécifiques aux friches sont préfixés par friche_
            friche.site_id as friche_site_id,
            friche.surface as friche_surface,
            -- les attributs spécifiques aux objets OCS GE sont préfixés par ocsge_
            ocsge.uuid as ocsge_uuid,
            ocsge.loaded_date as ocsge_loaded_date,
            -- les attributs communs aux deux tables sont sans préfixe
            ocsge.year,
            ocsge.departement,
            ocsge.index,
            ocsge.code_cs,
            ocsge.code_us,
            ocsge.is_artificial,
            ocsge.critere_seuil,
            ocsge.is_impermeable,
            ocsge.srid_source,
            (st_dump(st_intersection(friche.geom, ocsge.geom))).geom as geom
        from {{ ref("friche") }} as friche
        inner join
            {{ ref("occupation_du_sol_with_artif") }} as ocsge
            on friche.geom && ocsge.geom
            and st_intersects(friche.geom, ocsge.geom)
    )

select *, st_area(geom) as surface
from occupation_du_sol_friche_without_surface
