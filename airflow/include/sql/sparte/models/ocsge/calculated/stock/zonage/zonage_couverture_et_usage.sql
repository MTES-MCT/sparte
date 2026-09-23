{{
    config(
        materialized="table",
        indexes=[
            {"columns": ["part_id"], "type": "btree"},
            {"columns": ["zonage_checksum"], "type": "btree"},
            {"columns": ["commune_code"], "type": "btree"},
            {"columns": ["year", "index"], "type": "btree"},
        ],
    )
}}

/*
Répartition couverture × usage de l'OCS GE dans chaque zonage, au grain PART
(zonage × commune) et non plus au grain zonage entier.

Le grain part est ce qui permet aux agrégats territoriaux de se calculer par
simple `group by commune_code` : avant, `merge_ocsge_zonage_commune` joignait la
table de correspondance `zonage_commune` sur `zonage_checksum` et sommait la
surface du zonage ENTIER dans chacune des communes qu'il touchait. 19 % des
zonages sont à cheval sur plusieurs communes.

`zonage_checksum` reste porté : les statistiques du zonage entier se retrouvent
en regroupant sur cette colonne, les parts étant disjointes par construction.

Dénominateur de `percent` : `part_surface`, la surface du zonage restreinte à la
commune. Pas `zonage_surface`, qui porte le zonage entier, mer comprise en zone
littorale (les PLU zonent la mer, Admin Express s'arrête au trait de côte) alors
que l'OCS GE ne couvre que le terrestre.

Pas de garde contre la division par zéro : `zonage_urbanisme_commune` filtre les
parts de surface arrondie nulle, `part_surface` vaut donc au minimum 0,0001 m².
Les 70 zonages de surface dégénérée ne produisent aucune part et n'arrivent
jamais ici.
*/

with
    without_percent as (
        select
            part_id,
            zonage_checksum,
            commune_code,
            part_surface,
            zonage_surface,
            zonage_libelle,
            zonage_type,
            year,
            index,
            code_cs,
            code_us,
            is_artificial,
            is_impermeable,
            -- `surface` est déjà calculée en amont, et `geom` y est stockée dans
            -- `srid_source` : le `st_area(st_transform(geom, srid_source))` de la
            -- version précédente retransformait une géométrie déjà projetée.
            round(sum(surface)::numeric, 4) as surface
        from {{ ref("occupation_du_sol_zonage_urbanisme") }}
        group by
            part_id,
            zonage_checksum,
            commune_code,
            part_surface,
            zonage_surface,
            zonage_libelle,
            zonage_type,
            year,
            index,
            code_cs,
            code_us,
            is_artificial,
            is_impermeable
    )
select
    part_id,
    zonage_checksum,
    commune_code,
    part_surface,
    zonage_surface,
    zonage_libelle,
    zonage_type,
    year,
    index,
    surface,
    code_cs,
    code_us,
    surface / part_surface * 100 as percent,
    is_artificial,
    is_impermeable
from without_percent
