{{
    config(
        materialized="table",
        indexes=[
            {"columns": ["id_scot"], "type": "btree"},
            {"columns": ["geom"], "type": "gist"},
            {"columns": ["simple_geom"], "type": "gist"},
        ],
    )
}}

-- SCoT = identité + nom issus des périmètres GPU (gpu_scot, id_scot = siren du
-- porteur), et géométrie reconstruite par union des communes admin express
-- rattachées géographiquement (scot_geom). La géométrie communale est privilégiée à
-- celle du GPU pour rester iso avec admin express (frontières/sommets identiques),
-- ce qui est nécessaire aux traitements spatiaux downstream (tuiles, découpes ocsge).
--
-- INNER JOIN : seuls les SCoT ayant au moins une commune rattachée ont une géométrie.

SELECT
    gpu_scot.id_scot,
    gpu_scot.nom_scot,
    scot_geom.geom,
    scot_geom.simple_geom,
    ST_Area(scot_geom.geom) as surface,
    scot_geom.srid_source
FROM {{ ref('gpu_scot') }} as gpu_scot
INNER JOIN {{ ref('scot_geom') }} as scot_geom
    ON gpu_scot.id_scot = scot_geom.id_scot
