/*
    Modèle intermédiaire pour les géométries transformées en EPSG:4326.

    Ce modèle pré-calcule les transformations géométriques coûteuses une seule fois
    pour éviter de les recalculer dans chaque modèle qui en a besoin (ex: for_app_land).

    Contient :
    - geom_4326 : géométrie complète transformée en 4326
    - simple_geom_4326 : géométrie simplifiée transformée en 4326
    - geom_buffered_4326 : géométrie avec buffer de 500m transformée en 4326
    - bounds : bounding box de la géométrie
    - max_bounds : bounding box de la géométrie avec buffer
*/

{{
    config(
        materialized='table',
        indexes=[
            {"columns": ["land_id", "land_type"], "type": "btree"},
        ],
    )
}}

SELECT
    land_id,
    land_type,
    ST_Transform(geom, 4326) as geom_4326,
    ST_Transform(simple_geom, 4326) as simple_geom_4326,
    ST_Transform(ST_Buffer(geom, 500), 4326) as geom_buffered_4326
FROM {{ ref('land') }}
