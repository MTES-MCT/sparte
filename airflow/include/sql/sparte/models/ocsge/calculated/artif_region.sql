{{
    config(
        materialized='table',
        indexes=[
            {'columns': ['region'], 'type': 'btree'},
        ],
    )
}}

{{ merge_artif_commune_by_admin_level('region') }}
