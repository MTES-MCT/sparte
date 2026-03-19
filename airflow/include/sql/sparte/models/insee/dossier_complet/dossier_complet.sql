{{
    config(
        materialized='table',
        indexes=[{'columns': ['codgeo'], 'type': 'btree'}]
    )
}}

SELECT
    "CODGEO" as codgeo,
    variable,
    CASE
        WHEN value ~ '^-?[0-9]+([.,][0-9]+)?([eE][+-]?[0-9]+)?$' THEN REPLACE(value, ',', '.')::numeric
        ELSE NULL
    END as value,
    CASE
        WHEN value = 's' THEN 'secret_statistique'
        WHEN value = 'nd' THEN 'non_disponible'
        ELSE NULL
    END as status
FROM {{ source('public', 'insee_dossier_complet') }}
WHERE value IS NOT NULL AND value != ''
