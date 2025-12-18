{{
    config(
        materialized='table',
        indexes=[
            {'columns': ['land_id'], 'type': 'btree'},
            {'columns': ['distance_rank'], 'type': 'btree'},
            {'columns': ['nearest_land_id'], 'type': 'btree'},
        ]
    )
}}

{{ nearest_territories('DEPARTEMENT') }}
