{{
    config(
        materialized="table",
        indexes=[
            {"columns": ["part_id"], "type": "btree"},
            {"columns": ["zonage_checksum"], "type": "btree"},
            {"columns": ["commune_code"], "type": "btree"},
            {"columns": ["year_old"], "type": "btree"},
            {"columns": ["year_new"], "type": "btree"},
            {"columns": ["departement"], "type": "btree"},
            {"columns": ["geom"], "type": "gist"},
        ],
    )
}}

/*
Flux d'imperméabilisation entre deux millésimes, découpé par zonage d'urbanisme,
au grain (objet de différence, zonage, commune).

Même construction que `occupation_du_sol_zonage_urbanisme` pour le stock : les
deux entrées sont déjà découpées à la maille communale, `zonage_urbanisme_commune`
et `difference_commune`, si bien que la jointure porte d'abord sur
`commune_code`, une égalité sur index btree, et ne fait du spatial que sur le
résidu.

La version précédente croisait les zonages ENTIERS avec `difference`, en
jointure spatiale sur `departement` + `srid_source`. Le flux n'était donc rattaché
à aucune commune, et `zonage.departement` venait du `LIMIT 1` de
`3_zonage_urbanisme_projected` : pour un zonage à cheval sur deux départements, le
flux de l'autre département était perdu.
*/

with
    difference_zonage_without_surface as (
        select
            -- attributs du zonage découpé
            zonage.part_id,
            zonage.zonage_checksum,
            zonage.part_surface,
            zonage.zonage_surface,
            -- maille de rattachement, commune aux deux entrées
            zonage.commune_code,
            -- attributs des objets OCS GE
            ocsge.ocsge_loaded_date,
            ocsge.ocsge_uuid,
            ocsge.year_old,
            ocsge.year_new,
            ocsge.year_old_index,
            ocsge.year_new_index,
            ocsge.departement,
            ocsge.new_is_impermeable,
            ocsge.new_not_impermeable,
            ocsge.cs_old,
            ocsge.us_old,
            ocsge.cs_new,
            ocsge.us_new,
            ocsge.srid_source,
            -- Raccourci : quand l'objet de différence est entièrement contenu dans
            -- le zonage, l'intersection lui est égale. `st_covers` coûte bien moins
            -- cher que l'overlay de `st_intersection`, cf. le modèle de stock.
            (st_dump(
                case
                    when st_covers(zonage.geom, ocsge.geom) then ocsge.geom
                    else st_intersection(zonage.geom, ocsge.geom)
                end
            )).geom as geom
        from {{ ref("zonage_urbanisme_commune") }} as zonage
        inner join
            {{ ref("difference_commune") }} as ocsge
            on ocsge.commune_code = zonage.commune_code
            and ocsge.srid_source = zonage.srid_source
            and zonage.geom && ocsge.geom
            and st_intersects(zonage.geom, ocsge.geom)
    )

select *, st_area(geom) as surface
from difference_zonage_without_surface
