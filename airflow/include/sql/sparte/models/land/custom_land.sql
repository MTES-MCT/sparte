{{
    config(
        materialized='table',
        indexes=[
            {'columns': ['land_id'], 'type': 'btree'},
            {'columns': ['geom'], 'type': 'gist'}
        ])
}}

-- Agrège les communes pour créer des territoires personnalisés
-- Les définitions sont stockées dans les seeds custom_land et custom_land_commune

WITH custom_land_communes AS (
    SELECT
        clc.custom_land_id,
        clc.custom_land_name,
        clc.commune_code,
        c.geom,
        c.simple_geom,
        c.surface,
        c.departement,
        c.region,
        c.epci,
        c.scot
    FROM {{ ref('commune_custom_land') }} clc
    INNER JOIN {{ ref('commune') }} c ON clc.commune_code = c.code
),

aggregated AS (
    SELECT
        custom_land_id as land_id,
        custom_land_name as name,
        ST_Union(geom) as geom,
        ST_Union(simple_geom) as simple_geom,
        SUM(surface) as surface,
        array_agg(DISTINCT departement) as departements,
        -- Parent keys: tous les EPCI, départements, régions des communes membres
        array_agg(DISTINCT '{{ var("EPCI") }}_' || epci) ||
        array_agg(DISTINCT '{{ var("DEPARTEMENT") }}_' || departement) ||
        array_agg(DISTINCT '{{ var("REGION") }}_' || region) ||
        ARRAY['{{ var("NATION") }}_{{ var("NATION") }}'] as parent_keys
    FROM custom_land_communes
    GROUP BY custom_land_id, custom_land_name
)

SELECT
    land_id,
    '{{ var("CUSTOM") }}' as land_type,
    name,
    geom,
    simple_geom,
    surface,
    departements,
    -- Les custom lands contiennent des communes
    ARRAY['{{ var("COMMUNE") }}']::varchar[] as child_land_types,
    parent_keys
FROM aggregated
