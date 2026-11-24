/*
    Géométries très simplifiées des régions, départements et EPCI, pour la carte nationale.

    Les géométries simplifiées de `land` (simple_geom) restent lourdes à l'échelle du pays.
    Elles sont simplifiées une seconde fois, avec une tolérance plus forte et par
    projection : toute la métropole ensemble, chaque DROM à part. Deux voisins gardent
    exactement la même frontière (voir la macro simplify_lands_by_lot).

    Les communes, affichées seulement sous une région ou un département, ont leur propre
    modèle : land_national_map_commune_geom.
*/

{{
    config(
        materialized='table',
        indexes=[
            {"columns": ["land_id", "land_type"], "type": "btree"},
        ],
    )
}}

{% set tolerances = {
    var("REGION"): 3000,
    var("DEPARTEMENT"): 2000,
    var("EPCI"): 1000,
} %}

WITH tolerances (land_type, tolerance) AS (
    VALUES
    {% for land_type, tolerance in tolerances.items() %}
        ('{{ land_type }}', {{ tolerance }}){% if not loop.last %},{% endif %}
    {% endfor %}
),

source AS (
    SELECT
        land.land_id,
        land.land_type,
        ST_SRID(land.simple_geom)::text AS lot,
        tolerances.tolerance,
        land.simple_geom AS geom
    FROM {{ ref('land') }} AS land
    JOIN tolerances ON tolerances.land_type = land.land_type
),

simplified AS (
    {{ simplify_lands_by_lot('source') }}
)

SELECT
    land_id,
    land_type,
    tolerance,
    is_simplified,
    geom
FROM simplified
