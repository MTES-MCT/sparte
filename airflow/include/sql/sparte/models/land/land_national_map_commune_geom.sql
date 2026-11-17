/*
    Géométries allégées des communes pour la carte nationale, à l'échelle de la région
    puis du département qui les contient.

    La carte est une vue fixe, ajustée à son conteneur : ce qui compte est la déformation
    en pixels. La tolérance est donc proportionnelle à l'emprise du parent affiché, soit au
    plus un pixel sur une carte de 1 000 px de côté : environ 485 m pour la
    Nouvelle-Aquitaine, 120 m pour le département médian, 25 m (donc presque rien) pour
    les Hauts-de-Seine. Une tolérance unique écraserait les petits départements ou
    laisserait les grandes régions trop lourdes.

    Chaque lot est le parent affiché : les communes d'une région (ou d'un département)
    sont simplifiées ensemble et gardent des frontières identiques. Deux communes de lots
    différents ne sont jamais dessinées côte à côte avec ces géométries : sous un EPCI,
    qui peut chevaucher plusieurs départements ou régions, la carte garde simple_geom.

    On part de simple_geom (déjà cohérent entre voisins, 14 fois moins de points que geom) :
    simplifier les communes de toute la France d'un bloc depuis geom a dépassé dix minutes
    sans aboutir.
*/

{{
    config(
        materialized='table',
        indexes=[
            {"columns": ["land_id", "parent_land_type"], "type": "btree"},
        ],
    )
}}

{# Côté, en pixels, de la carte pour laquelle la tolérance vaut au plus un pixel #}
{% set display_size_px = 1000 %}

-- MATERIALIZED : la tolérance est calculée une fois par parent. Sans cela, si la CTE n'est
-- plus lue qu'une fois, PostgreSQL relit l'emprise du parent pour chacune de ses communes.
WITH parents AS MATERIALIZED (
    SELECT
        land_id,
        land_type,
        land_type || '_' || land_id AS parent_key,
        round(
            greatest(
                ST_XMax(simple_geom) - ST_XMin(simple_geom),
                ST_YMax(simple_geom) - ST_YMin(simple_geom)
            ) / {{ display_size_px }}
        ) AS tolerance
    FROM {{ ref('land') }}
    WHERE land_type IN ('{{ var("REGION") }}', '{{ var("DEPARTEMENT") }}')
),

source AS (
    -- Jointure par appartenance seule, pour qu'elle passe par l'index GIN de parent_keys
    SELECT
        commune.land_id,
        commune.land_type,
        parents.parent_key AS lot,
        parents.tolerance,
        commune.simple_geom AS geom
    FROM {{ ref('land') }} AS commune
    JOIN parents
        ON commune.parent_keys @> ARRAY[parents.parent_key]
    WHERE commune.land_type = '{{ var("COMMUNE") }}'
),

simplified AS (
    {{ simplify_lands_by_lot('source') }}
)

SELECT
    simplified.land_id,
    simplified.land_type,
    parents.land_type AS parent_land_type,
    parents.land_id AS parent_land_id,
    simplified.tolerance,
    simplified.is_simplified,
    simplified.geom
FROM simplified
JOIN parents
    ON parents.parent_key = simplified.lot
