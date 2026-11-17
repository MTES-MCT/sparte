{% macro simplify_lands_by_lot(source) %}
{#
    Simplifie des territoires par lots, en gardant des frontières identiques entre les
    voisins d'un même lot.

    Paramètre `source` : nom d'une relation ou d'une CTE, avec une ligne par territoire et
    par lot. Colonnes attendues :
        - land_id, land_type ;
        - lot : les territoires d'un même lot (et d'un même land_type) sont simplifiés
          ensemble. Un lot ne contient qu'une seule projection ;
        - tolerance : tolérance de simplification en mètres, la même pour tout le lot ;
        - geom : géométrie surfacique valide à simplifier.
    Ce nom ne doit pas commencer par `simplify_`, préfixe réservé aux CTE de la macro.

    Renvoie une requête (utilisable comme corps de CTE) avec exactement une ligne par
    ligne de `source` : land_id, land_type, lot, tolerance, is_simplified, geom.

    Méthode, reprise de la macro `simplify` :
        1. les contours du lot sont fusionnés en un réseau de lignes, où une frontière
           partagée ne figure qu'une fois ;
        2. le réseau est simplifié d'un bloc, puis redécoupé en faces ;
        3. chaque face revient au territoire qui en couvre plus de la moitié. Un point
           intérieur de la face ne suffit pas : pour une île ou une presqu'île étroite,
           il tombe souvent en mer et la face serait perdue ;
        4. les îlots plus petits que le carré de la tolérance sont retirés, un territoire
           gardant toujours sa plus grande partie.

    Repli : un territoire trop petit pour la tolérance peut ne retrouver aucune face, ou
    seulement une fraction de sa surface. Il garde alors sa géométrie d'entrée
    (is_simplified = false), qui peut déborder légèrement sur ses voisins simplifiés :
    aucun territoire ne disparaît.
#}
WITH simplify_sources AS (
    SELECT
        land_id,
        land_type,
        lot,
        tolerance,
        geom,
        {{ bounding_box_columns('geom') }}
    FROM {{ source }}
),

simplify_rings AS (
    SELECT
        land_type,
        lot,
        tolerance,
        ST_ExteriorRing((ST_DumpRings((ST_Dump(geom)).geom)).geom) AS geom
    FROM simplify_sources
),

simplify_networks AS (
    SELECT
        land_type,
        lot,
        tolerance,
        ST_LineMerge(ST_Union(geom)) AS geom
    FROM simplify_rings
    GROUP BY land_type, lot, tolerance
),

-- MATERIALIZED : sans cela, le planificateur recalcule l'emprise de la face pour chaque
-- couple (face, territoire) comparé dans simplify_attributed_faces
simplify_faces AS MATERIALIZED (
    SELECT
        land_type,
        lot,
        tolerance,
        geom,
        {{ bounding_box_columns('geom') }}
    FROM (
        SELECT
            land_type,
            lot,
            tolerance,
            (ST_Dump(ST_Polygonize(ST_SimplifyPreserveTopology(geom, tolerance)))).geom AS geom
        FROM simplify_networks
        GROUP BY land_type, lot, tolerance
    ) AS polygonized
),

simplify_attributed_faces AS (
    SELECT
        sources.land_id,
        sources.land_type,
        sources.lot,
        faces.tolerance,
        faces.geom
    FROM simplify_faces AS faces
    -- Une CTE n'a pas d'index spatial : toutes les faces du lot sont comparées à tous ses
    -- territoires. Comparer d'abord les emprises, déjà calculées, ne coûte presque rien ;
    -- le même tri fait sur les géométries prenait 2 µs par couple, soit plus de quatre
    -- minutes pour les 140 millions de couples des communes de toute la France.
    JOIN simplify_sources AS sources
        ON sources.land_type = faces.land_type
        AND sources.lot = faces.lot
        AND sources.x_min <= faces.x_max
        AND sources.x_max >= faces.x_min
        AND sources.y_min <= faces.y_max
        AND sources.y_max >= faces.y_min
    WHERE ST_Intersects(sources.geom, faces.geom)
        AND ST_Area(ST_Intersection(sources.geom, faces.geom)) > 0.5 * ST_Area(faces.geom)
),

simplify_ranked_faces AS (
    SELECT
        *,
        row_number() OVER (
            PARTITION BY land_id, land_type, lot
            ORDER BY ST_Area(geom) DESC
        ) AS area_rank
    FROM simplify_attributed_faces
),

simplify_rebuilt AS (
    SELECT
        land_id,
        land_type,
        lot,
        ST_Multi(ST_Union(geom)) AS geom
    FROM simplify_ranked_faces
    WHERE area_rank = 1 OR ST_Area(geom) >= tolerance * tolerance
    GROUP BY land_id, land_type, lot
),

simplify_checked AS (
    SELECT
        sources.land_id,
        sources.land_type,
        sources.lot,
        sources.tolerance,
        sources.geom AS source_geom,
        rebuilt.geom AS rebuilt_geom,
        -- Faux aussi quand aucune face n'a été retrouvée (rebuilt.geom nul)
        coalesce(ST_Area(rebuilt.geom) >= 0.5 * ST_Area(sources.geom), false) AS is_simplified
    FROM simplify_sources AS sources
    LEFT JOIN simplify_rebuilt AS rebuilt
        ON rebuilt.land_id = sources.land_id
        AND rebuilt.land_type = sources.land_type
        AND rebuilt.lot = sources.lot
)

SELECT
    land_id,
    land_type,
    lot,
    tolerance,
    is_simplified,
    CASE WHEN is_simplified THEN rebuilt_geom ELSE ST_Multi(source_geom) END AS geom
FROM simplify_checked
{% endmacro %}


{% macro bounding_box_columns(geometry_column) -%}
{#- Emprise d'une géométrie en quatre colonnes numériques, comparables sans relire la géométrie -#}
ST_XMin({{ geometry_column }}) AS x_min,
        ST_XMax({{ geometry_column }}) AS x_max,
        ST_YMin({{ geometry_column }}) AS y_min,
        ST_YMax({{ geometry_column }}) AS y_max
{%- endmacro %}
