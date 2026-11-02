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
-- rattachée au SCoT (périmètres GPU, cf. gpu_scot : validés + en projet hors du
-- territoire des validés, après retrait des périmètres en conflit) dont le polygone
-- contient son ST_PointOnSurface (toujours à l'intérieur du polygone, contrairement
-- au centroïde). Comparaison en EPSG:4326 (commune.geom_4326 et gpu_scot.geom sont
-- tous deux en 4326).
--
-- Robuste aux changements de code COG (fusions/scissions) : aucun join par code
-- commune, contrairement à l'ancienne liste sudocuh_scot_communes figée en COG 2024.
--
-- DISTINCT ON (commune.code) : gpu_scot garantit déjà qu'aucune commune n'a son
-- point intérieur dans deux périmètres (le plus ancien des deux est écarté). Le
-- DISTINCT ON reste comme garde-fou, le test `unique` sur commune_code aussi ;
-- l'ordre (validé d'abord, puis plus petit id_scot) ne devrait jamais servir.

select distinct on (commune.code)
    commune.code as commune_code,
    commune.name as commune_nom,
    scot.id_scot,
    scot.nom_scot,
    scot.approved
from {{ ref('commune_sans_scot') }} as commune
inner join {{ ref('gpu_scot') }} as scot
    on ST_Intersects(ST_PointOnSurface(commune.geom_4326), scot.geom)
order by commune.code, scot.approved desc, scot.id_scot
