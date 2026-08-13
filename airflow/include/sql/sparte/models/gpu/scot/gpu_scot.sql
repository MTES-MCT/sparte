{{
    config(
        materialized="table",
        indexes=[
            {"columns": ["id_scot"], "type": "btree"},
            {"columns": ["geom"], "type": "gist"},
        ],
    )
}}

-- Périmètres SCoT du GPU (Géoportail de l'urbanisme), source de référence pour le
-- rattachement géographique commune -> SCoT (cf. scot_communes).
--
-- Règles :
--   - on ne garde que les SCoT opposables (`approved`) : les SCoT en projet
--     (approved = 0) chevauchent les opposables et rattacheraient une commune à
--     plusieurs SCoT ;
--   - un même SCoT (même `name` = 'scot_<siren>') peut ressortir en plusieurs
--     features (multi-polygone) -> on recolle par ST_Union et on regroupe par name ;
--   - id_scot = siren du porteur (name sans le préfixe 'scot_') ;
--   - géométrie en EPSG:4326 (SRID natif de l'export GPU).

with opposables as (
    select
        name,
        max(title) as title,
        ST_Union(geom) as geom
    from {{ source('public', 'gpu_scot') }}
    where approved::int = 1
      and name is not null
    group by name
)

select
    replace(name, 'scot_', '') as id_scot,
    replace(initcap(title), 'Scot', 'SCOT') as nom_scot,
    geom,
    4326 as srid_source
from opposables
