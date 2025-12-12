{{
    config(
        materialized='table',
        indexes=[
            {'columns': ['land_id'], 'type': 'btree'},
            {'columns': ['similarity_rank'], 'type': 'btree'},
            {'columns': ['similar_land_id'], 'type': 'btree'},
        ]
    )
}}

{{ similar_territories('SCOT', 'flux_population_scot', 'scot') }}
