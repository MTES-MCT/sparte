{{
    config(
        materialized='table',
        indexes=[
            {'columns': ['id'], 'type': 'btree'},
            {'columns': ['code'], 'type': 'btree'},
            {'columns': ['name'], 'type': 'btree'},
            {'columns': ['region'], 'type': 'btree'},
            {'columns': ['geom'], 'type': 'gist'}
        ])
}}

SELECT * FROM {{ ref('departement_guadeloupe') }}
UNION ALL
SELECT * FROM {{ ref('departement_martinique') }}
UNION ALL
SELECT * FROM {{ ref('departement_guyane') }}
UNION ALL
SELECT * FROM {{ ref('departement_reunion') }}
UNION ALL
SELECT * FROM {{ ref('departement_metropole') }}
