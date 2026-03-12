{{
    config(
        materialized='table',
        indexes=[
            {"columns": ["land_id", "land_type", "child_land_type"], "type": "btree"},
        ],
    )
}}

/*
FeatureCollection GeoJSON pré-calculée pour chaque territoire parent + type d'enfant.
Chaque ligne contient le GeoJSON complet prêt à être envoyé au frontend.
*/

SELECT
    parent.land_id,
    parent.land_type,
    child.land_type as child_land_type,
    jsonb_build_object(
        'type', 'FeatureCollection',
        'features', jsonb_agg(
            jsonb_build_object(
                'type', 'Feature',
                'properties', jsonb_build_object(
                    'land_id', child.land_id,
                    'name', child.name
                ),
                'geometry', ST_AsGeoJSON(ST_Transform(child_geom.simple_geom_4326, 3857))::jsonb
            )
        )
    ) as geojson
FROM {{ ref('land') }} as parent
JOIN {{ ref('land') }} as child
    ON child.parent_keys @> ARRAY[parent.land_type || '_' || parent.land_id]
JOIN {{ ref('land_geom_4326') }} as child_geom
    ON child_geom.land_id = child.land_id
    AND child_geom.land_type = child.land_type
WHERE child_geom.simple_geom_4326 IS NOT NULL
GROUP BY parent.land_id, parent.land_type, child.land_type
