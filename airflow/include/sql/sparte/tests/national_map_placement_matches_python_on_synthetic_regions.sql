/*
    Le placement des DROM de la carte nationale est écrit deux fois : en SQL (macro
    national_map_drom_placement, pour les tuiles de communes) et en Python
    (public_data/domain/national_map.py, pour les fonds GeoJSON servis par Django). Si les
    deux divergeaient, les communes d'outre-mer ne se superposeraient plus à leur
    département en passant d'une maille à l'autre.

    Ce test passe à la macro un jeu d'essai synthétique, des rectangles en EPSG:3857 pour
    l'Hexagone, la Corse et les cinq DROM, et compare le résultat à des valeurs écrites en
    clair. Ces valeurs ont été calculées par le code Python sur les mêmes rectangles : le
    même jeu d'essai et les mêmes valeurs doivent figurer dans les tests Python du
    placement, et toute modification doit être reportée des deux côtés.

    Le test retourne les régions dont le placement s'écarte des valeurs attendues, celles
    qui manquent et celles qui sont en trop.
*/

-- La macro testée est celle qui construit ce modèle : le test est lancé avec lui et, s'il
-- échoue, les modèles qui lisent le placement ne sont pas construits.
-- depends_on: {{ ref('national_map_drom_placement') }}

{% set coordinate_tolerance = 0.001 %}  {# en mètres #}
{% set factor_tolerance = 0.000000001 %}

WITH regions (region_code, geom) AS (
    VALUES
    -- Référence. Chaque bord de l'emprise commune vient d'un seul des deux rectangles :
    -- elle va de (-570 000 ; 5 060 000) à (1 060 000 ; 6 640 000)
    ('11', ST_MakeEnvelope(-570000, 5070000, 830000, 6640000, 3857)),
    ('94', ST_MakeEnvelope(950000, 5060000, 1060000, 5310000, 3857)),
    -- Outre-mer, à des positions et avec des dimensions proches des vraies
    ('01', ST_MakeEnvelope(-6880000, 1790000, -6790000, 1865000, 3857)),
    ('02', ST_MakeEnvelope(-6815000, 1620000, -6770000, 1675000, 3857)),
    ('03', ST_MakeEnvelope(-6080000, 235000, -5745000, 640000, 3857)),
    ('04', ST_MakeEnvelope(6145000, -2440000, 6215000, -2375000, 3857)),
    ('06', ST_MakeEnvelope(5015000, -1460000, 5045000, -1420000, 3857))
),

placement AS (
    {{ national_map_drom_placement('regions') }}
),

expected (region_code, name, scale_factor, x_offset, y_offset, inset_geom, slot_geom) AS (
    VALUES
    (
        '01', 'Guadeloupe', 1.393363032659, 8794711.328, 4002779.058,
        ST_MakeEnvelope(-791626.336, 6496898.886, -666223.664, 6601401.114, 3857),
        ST_MakeEnvelope(-896000, 6458300, -561850, 6640000, 3857)
    ),
    (
        '02', 'Martinique', 1.403856441564, 9140919.879, 4236296.513,
        ST_MakeEnvelope(-426361.770, 6510543.948, -363188.230, 6587756.052, 3857),
        ST_MakeEnvelope(-561850, 6458300, -227700, 6640000, 3857)
    ),
    (
        '03', 'Guyane', 1.447544086458, 7960079.411, 4821699.462,
        ST_MakeEnvelope(-840988.634, 5161872.322, -356061.366, 5748127.678, 3857),
        ST_MakeEnvelope(-896000, 5060000, -301050, 5850000, 3857)
    ),
    (
        '04', 'La Réunion', 1.353387347995, -9092858.811, 9625730.040,
        ST_MakeEnvelope(-776293.557, 6323464.911, -681556.443, 6411435.089, 3857),
        ST_MakeEnvelope(-896000, 6276600, -561850, 6458300, 3857)
    ),
    (
        '06', 'Mayotte', 1.414740867143, -7510921.562, 8404676.849,
        ST_MakeEnvelope(-415996.113, 6339155.183, -373553.887, 6395744.817, 3857),
        ST_MakeEnvelope(-561850, 6276600, -227700, 6458300, 3857)
    )
),

-- Emprise de référence et ligne de séparation, les mêmes pour toutes les régions
expected_frame AS (
    SELECT
        ST_MakeEnvelope(-570000, 5060000, 1060000, 6640000, 3857) AS reference_geom,
        ST_GeomFromText(
            'LINESTRING(-244000 6687400, -244000 6324000, -635200 6260800, -635200 6023800, -309200 5865800, -309200 5044200)',
            3857
        ) AS separation_geom
)

SELECT
    coalesce(expected.region_code, placement.region_code) AS region_code,
    placement.name,
    placement.scale_factor,
    placement.x_offset,
    placement.y_offset,
    ST_AsText(placement.inset_geom) AS inset_geom,
    ST_AsText(placement.slot_geom) AS slot_geom,
    ST_AsText(placement.reference_geom) AS reference_geom,
    ST_AsText(placement.separation_geom) AS separation_geom
FROM expected
CROSS JOIN expected_frame
FULL JOIN placement
    ON placement.region_code = expected.region_code
WHERE expected.region_code IS NULL
    OR placement.region_code IS NULL
    OR placement.name <> expected.name
    OR abs(placement.scale_factor - expected.scale_factor) > {{ factor_tolerance }}
    OR abs(placement.x_offset - expected.x_offset) > {{ coordinate_tolerance }}
    OR abs(placement.y_offset - expected.y_offset) > {{ coordinate_tolerance }}
    -- Entre deux rectangles ou deux polylignes de mêmes sommets, la distance de Hausdorff
    -- est le plus grand écart entre sommets homologues
    OR ST_HausdorffDistance(placement.inset_geom, expected.inset_geom) > {{ coordinate_tolerance }}
    OR ST_HausdorffDistance(placement.slot_geom, expected.slot_geom) > {{ coordinate_tolerance }}
    OR ST_HausdorffDistance(placement.reference_geom, expected_frame.reference_geom) > {{ coordinate_tolerance }}
    OR ST_NPoints(placement.separation_geom) <> ST_NPoints(expected_frame.separation_geom)
    OR ST_HausdorffDistance(placement.separation_geom, expected_frame.separation_geom) > {{ coordinate_tolerance }}
