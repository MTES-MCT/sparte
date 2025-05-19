{{
    config(
        materialized="table",
        indexes=[
            {"columns": ["departement"], "type": "btree"},
            {"columns": ["year"], "type": "btree"},
            {"columns": ["commune_code"], "type": "btree"},
            {"columns": ["ocsge_uuid"], "type": "btree"},
            {"columns": ["geom"], "type": "gist"},
            {"columns": ["ocsge_loaded_date"], "type": "btree"},
        ],
    )
}}

/*

Cette requête découpe les objets OCS GE d'occupation du sol par commune.

Dans le cas où un objet OCS GE est découpé par plusieurs communes, il sera dupliqué, mais
la surface totale de l'objet sera conservée.

*/
with
    occupation_du_sol_commune_without_surface as (
        select
            concat(ocsge.uuid::text, '_', commune.code::text) as ocsge_commune_id,  -- surrogate key
            -- les attributs spécifiques aux communes sont préfixés par commune_
            commune.code as commune_code,
            commune.surface as commune_surface,
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
            (st_dump(st_intersection(commune.geom, ocsge.geom))).geom as geom
        from {{ ref("commune") }} as commune
        inner join
            {{ ref("occupation_du_sol_with_artif") }} as ocsge
            on ocsge.departement = commune.departement
            and ocsge.srid_source = commune.srid_source
            and commune.geom && ocsge.geom
            and st_intersects(commune.geom, ocsge.geom)
    )

select *, st_area(geom) as surface
from occupation_du_sol_commune_without_surface
