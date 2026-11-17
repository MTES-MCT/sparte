{{
    config(
        materialized='table',
        indexes=[
            {"columns": ["land_id", "land_type", "child_land_type"], "type": "btree"},
        ],
    )
}}

/*
FeatureCollection GeoJSON des fonds de la carte nationale, par territoire parent et par maille.

Par rapport à for_app_land_geojson :
- régions, départements et EPCI utilisent les géométries très simplifiées de
  land_national_map_geom, les mêmes sous tous les parents ;
- les communes d'une région ou d'un département utilisent land_national_map_commune_geom,
  allégées pour l'échelle de ce parent ; sous un EPCI elles gardent simple_geom, assez
  léger à cette échelle et cohérent même quand l'EPCI chevauche plusieurs départements ;
- les coordonnées (EPSG:3857, en mètres) sont arrondies au mètre, ce qui divise le
  poids du GeoJSON par deux sans effet visible ;
- la France entière par EPCI existe (les EPCI n'ont pas la nation dans leurs parents) ;
- seules les mailles affichées par la carte sont calculées : jamais les communes de
  toute la France, jamais une maille moins fine que le parent ;
- le fond d'un département par EPCI porte en plus la limite du département, dans le membre
  `parent_boundary` de sa FeatureCollection (coordonnées d'un MultiLineString, même
  projection et même arrondi que les entités) : ses EPCI à cheval sur plusieurs
  départements débordent, voir land_national_map_parent_boundary_geom. Un département dont
  aucun EPCI n'est à cheval (22 sur 101, dont les DROM) n'en porte pas : la limite y
  ferait le tour des EPCI dessinés, sans rien apprendre. Un membre du
  GeoJSON plutôt qu'une colonne : la table de l'app et son modèle Django ne changent pas,
  et un fond construit avant ce calcul reste lisible, simplement sans limite.
*/

{% set nation = var("NATION") %}
{# Mailles affichées sous chaque type de parent, toujours plus fines que lui #}
{% set children_by_parent = {
    var("REGION"): [var("DEPARTEMENT"), var("EPCI"), var("COMMUNE")],
    var("DEPARTEMENT"): [var("EPCI"), var("COMMUNE")],
    var("EPCI"): [var("COMMUNE")],
} %}
{% set national_children = [var("REGION"), var("DEPARTEMENT"), var("EPCI")] %}

WITH pairs AS (
    -- Toute la France : régions, départements et EPCI, jamais les communes
    SELECT
        '{{ nation }}' AS land_id,
        '{{ nation }}' AS land_type,
        child.land_id AS child_land_id,
        child.land_type AS child_land_type
    FROM {{ ref('land') }} AS child
    WHERE child.land_type IN ('{{ national_children | join("', '") }}')

    {% for parent_type, child_types in children_by_parent.items() %}
    UNION ALL
    -- Jointure par appartenance seule, pour qu'elle passe par l'index GIN de parent_keys
    SELECT
        parent.land_id,
        parent.land_type,
        child.land_id AS child_land_id,
        child.land_type AS child_land_type
    FROM {{ ref('land') }} AS parent
    JOIN {{ ref('land') }} AS child
        ON child.parent_keys @> ARRAY[parent.land_type || '_' || parent.land_id]
    WHERE parent.land_type = '{{ parent_type }}'
        AND child.land_type IN ('{{ child_types | join("', '") }}')
    {% endfor %}
),

-- Géométrie de chaque territoire selon le type du parent sous lequel il est affiché
-- (parent_land_type nul : la même géométrie sous tous les parents)
geometries AS (
    SELECT
        land_id,
        land_type,
        NULL::text AS parent_land_type,
        geom
    FROM {{ ref('land_national_map_geom') }}

    UNION ALL
    SELECT
        land_id,
        land_type,
        parent_land_type,
        geom
    FROM {{ ref('land_national_map_commune_geom') }}

    UNION ALL
    SELECT
        land_id,
        land_type,
        '{{ var("EPCI") }}' AS parent_land_type,
        simple_geom AS geom
    FROM {{ ref('land') }}
    WHERE land_type = '{{ var("COMMUNE") }}'
),

features AS (
    SELECT
        pairs.land_id,
        pairs.land_type,
        pairs.child_land_type,
        child.land_id AS child_land_id,
        jsonb_build_object(
            'type', 'Feature',
            'properties', jsonb_build_object(
                'land_id', child.land_id,
                'name', child.name
            ),
            'geometry', ST_AsGeoJSON(ST_Transform(geometries.geom, 3857), 0)::jsonb
        ) AS feature
    FROM pairs
    JOIN {{ ref('land') }} AS child
        ON child.land_id = pairs.child_land_id
        AND child.land_type = pairs.child_land_type
    JOIN geometries
        ON geometries.land_id = pairs.child_land_id
        AND geometries.land_type = pairs.child_land_type
        AND coalesce(geometries.parent_land_type, pairs.land_type) = pairs.land_type
),

collections AS (
    SELECT
        land_id,
        land_type,
        child_land_type,
        jsonb_build_object(
            'type', 'FeatureCollection',
            'features', jsonb_agg(feature ORDER BY child_land_id)
        ) AS geojson
    FROM features
    GROUP BY land_id, land_type, child_land_type
)

SELECT
    collections.land_id,
    collections.land_type,
    collections.child_land_type,
    CASE
        WHEN boundary.geom IS NULL THEN collections.geojson
        ELSE collections.geojson || jsonb_build_object(
            'parent_boundary',
            ST_AsGeoJSON(ST_Transform(boundary.geom, 3857), 0)::jsonb -> 'coordinates'
        )
    END AS geojson
FROM collections
LEFT JOIN {{ ref('land_national_map_parent_boundary_geom') }} AS boundary
    ON boundary.land_id = collections.land_id
    AND boundary.land_type = collections.land_type
    AND boundary.child_land_type = collections.child_land_type
    -- Sans entité à cheval, la limite n'est que le contour extérieur du fond : pas servie
    AND boundary.straddling_count > 0
