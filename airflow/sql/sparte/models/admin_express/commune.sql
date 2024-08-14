
{{
    config(
        materialized='table',
        indexes=[
            {'columns': ['departement'], 'type': 'btree'},
            {'columns': ['code'], 'type': 'btree'},
            {'columns': ['geom'], 'type': 'gist'}
        ])
}}

SELECT
    id,
    nom as name,
    nom_m as name_uppercase,
    insee_com as code,
    statut as type,
    population as population,
    insee_can as canton,
    insee_arr as arrondissement,
    insee_dep as departement,
    insee_reg as region,
    siren_epci as epci,
    ST_Area(geom) as surface,
    gen_random_uuid() as uuid,
    geom
FROM
    {{ source('public', 'commune') }} as commune
