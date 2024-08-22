
{{
    config(
        materialized='table',
        indexes=[
            {'columns': ['code'], 'type': 'btree'},
            {'columns': ['geom'], 'type': 'gist'}
        ])
}}

SELECT
    id,
    nom as name,
    nom_m as name_uppercase,
    insee_dep as code,
    insee_reg as region,
    ST_Area(geom) as surface,
    gen_random_uuid() as uuid,
    geom
FROM
    {{ source('public', 'departement') }} as departement
