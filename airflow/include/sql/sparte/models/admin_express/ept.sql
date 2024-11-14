{{
    config(
        materialized='table',
        indexes=[
            {'columns': ['id'], 'type': 'btree'},
            {'columns': ['code'], 'type': 'btree'},
            {'columns': ['name'], 'type': 'btree'},
            {'columns': ['geom'], 'type': 'gist'}
        ])
}}
SELECT * FROM {{ ref('epci_tout_type') }} WHERE is_ept = true
