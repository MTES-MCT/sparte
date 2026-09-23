{{
    config(
        materialized="table",
        indexes=[
            {"columns": ["departement"], "type": "btree"},
            {"columns": ["year"], "type": "btree"},
            {"columns": ["uuid"], "type": "btree"},
            {"columns": ["zonage_checksum"], "type": "btree"},
            {"columns": ["part_id"], "type": "btree"},
            {"columns": ["commune_code"], "type": "btree"},
            {"columns": ["ocsge_loaded_date"], "type": "btree"},
            {"columns": ["zonage_gpu_timestamp"], "type": "btree"},
            {"columns": ["geom"], "type": "gist"},
        ],
    )
}}

/*
Croisement OCS GE × zonages d'urbanisme, au grain (objet OCS GE, zonage, commune).

Les deux entrées sont déjà découpées à la maille communale :
`zonage_urbanisme_commune` et `occupation_du_sol_commune`. La jointure porte donc
d'abord sur `commune_code`, une égalité sur index btree, et ne fait du spatial que
sur le résidu.

L'ancienne version croisait `zonage_urbanisme` (zonages entiers) avec la VUE
`occupation_du_sol_with_artif`, en jointure purement spatiale sur
`srid_source` + `departement` + `&&`. Trois problèmes :

  - la vue était recalculée à la volée, sans index ni statistiques ;
  - le filtre `zonage.departement = ocsge.departement` s'appuyait sur un
    département choisi arbitrairement par le `LIMIT 1` de
    `3_zonage_urbanisme_projected` : pour un zonage à cheval sur deux
    départements, l'OCS GE de l'autre département était perdu ;
  - surtout, le résultat n'était pas rattaché à une commune, si bien que
    `merge_ocsge_zonage_commune` sommait la surface du zonage ENTIER dans
    chacune des communes qu'il touchait. 19 % des zonages sont concernés.

`part_surface` est le dénominateur à utiliser en aval pour les pourcentages :
c'est la surface du zonage restreinte à la commune. `zonage_surface`, conservée
pour mémoire, porte la surface du zonage entier, mer comprise en zone littorale.
*/

with
    occupation_du_sol_zonage_urbanisme_without_surface as (
        select
            -- surrogate key ; non unique par construction, st_dump ci-dessous
            -- éclate chaque intersection multi-parties en plusieurs lignes
            concat(ocsge.ocsge_uuid::text, '_', zonage.part_id) as ocsge_zonage_id,
            -- attributs du zonage découpé, préfixés par zonage_
            zonage.part_id,
            zonage.zonage_checksum,
            zonage.libelle as zonage_libelle,
            zonage.gpu_timestamp as zonage_gpu_timestamp,
            zonage.type_zone as zonage_type,
            zonage.zonage_surface,
            zonage.part_surface,
            -- maille de rattachement, commune aux deux entrées
            zonage.commune_code,
            -- attributs des objets OCS GE, préfixés par ocsge_
            ocsge.ocsge_loaded_date,
            -- attributs communs
            ocsge.year,
            ocsge.index,
            ocsge.departement,
            ocsge.code_cs,
            ocsge.code_us,
            ocsge.ocsge_uuid as uuid,
            ocsge.is_artificial,
            ocsge.critere_seuil,
            ocsge.is_impermeable,
            ocsge.srid_source,
            -- Raccourci : quand l'objet OCS GE est entièrement contenu dans le
            -- zonage, l'intersection lui est égale, on réutilise sa géométrie telle
            -- quelle. C'est le cas de 40,5 % des couples. `st_covers` est un prédicat
            -- bien moins coûteux que l'overlay de `st_intersection`, et le payer sur
            -- 100 % des couples reste gagnant : mesuré sur 15 communes du 56,
            -- 44,5 s sans le raccourci contre 21,8 s avec, à résultat identique.
            (st_dump(
                case
                    when st_covers(zonage.geom, ocsge.geom) then ocsge.geom
                    else st_intersection(zonage.geom, ocsge.geom)
                end
            )).geom as geom
        from {{ ref("zonage_urbanisme_commune") }} as zonage
        inner join
            {{ ref("occupation_du_sol_commune") }} as ocsge
            on ocsge.commune_code = zonage.commune_code
            and ocsge.srid_source = zonage.srid_source
            and zonage.geom && ocsge.geom
            and st_intersects(zonage.geom, ocsge.geom)
    )
select *, st_area(geom) as surface
from occupation_du_sol_zonage_urbanisme_without_surface
