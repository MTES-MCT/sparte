{{
    config(
        materialized="table",
        indexes=[
            {"columns": ["commune_code"], "type": "btree"},
            {"columns": ["id_scot"], "type": "btree"},
        ],
    )
}}

-- Rattachement géographique commune -> SCoT : chaque commune (admin express) est
-- rattachée au SCoT opposable (périmètres GPU, cf. gpu_scot) dont le polygone
-- contient son ST_PointOnSurface (toujours à l'intérieur du polygone, contrairement
-- au centroïde). Comparaison en EPSG:4326 (commune.geom_4326 et gpu_scot.geom sont
-- tous deux en 4326).
--
-- Robuste aux changements de code COG (fusions/scissions) : aucun join par code
-- commune, contrairement à l'ancienne liste sudocuh_scot_communes figée en COG 2024.
--
-- DISTINCT ON (commune.code) : garantit au plus un SCoT par commune même en cas de
-- léger chevauchement de périmètres GPU. Condition nécessaire au LEFT JOIN dans
-- `commune` (sans quoi les communes seraient dupliquées).

select distinct on (commune.code)
    commune.code as commune_code,
    commune.name as commune_nom,
    scot.id_scot,
    scot.nom_scot
from {{ ref('commune_sans_scot') }} as commune
inner join {{ ref('gpu_scot') }} as scot
    on ST_Intersects(ST_PointOnSurface(commune.geom_4326), scot.geom)
order by commune.code, scot.id_scot
