{{
    config(
        materialized="table",
        indexes=[
            {"columns": ["loaded_date"], "type": "btree"},
            {"columns": ["departement", "year"], "type": "btree"},
            {"columns": ["departement"], "type": "btree"},
            {"columns": ["uuid"], "type": "btree"},
            {"columns": ["code_cs"], "type": "btree"},
            {"columns": ["code_us"], "type": "btree"},
            {"columns": ["geom"], "type": "gist"},
            {"columns": ["srid_source"], "type": "btree"},
        ],
    )
}}

/*

Les données d'occupation du sol étant mal découpé par département, on les recoupe
avec les géométries des départements issues d'admin Express.

L'utilisation conjointe de st_intersection et st_dump permet d'éviter qu'une partie
des données d'occupation du sol ne soient perdues lors du découpage : ST_Intersection
est en effet succeptible de générer des geometrycollection, même si le type des géométries
en entrée est homogène.

*/
with
    without_surface as (
        select
            to_timestamp(loaded_date) as loaded_date,
            occupation.id,
            code_cs,
            code_us,
            departement,
            year,
            {{ is_impermeable("code_cs") }} as is_impermeable,
            {{ is_artificial("code_cs", "code_us") }} as is_artificial,
            uuid::uuid,
            (
                st_dump(st_intersection(departement_table.geom, occupation.geom))
            ).geom as geom,
            departement_table.srid_source as srid_source
        from {{ source("public", "ocsge_occupation_du_sol") }} as occupation
        left join
            {{ ref("departement") }} as departement_table
            on departement = departement_table.code
    )
select *, st_area(geom) as surface
from without_surface
where not st_isempty(geom)
