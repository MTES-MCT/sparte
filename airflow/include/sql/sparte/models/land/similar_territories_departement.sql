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

{{ similar_territories('DEPARTEMENT', 'flux_population_departement', 'departement') }}
