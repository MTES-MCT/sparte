{{
    config(
        materialized="table",
        indexes=[{"columns": ["epci"], "type": "btree"}],
    )
}}

{{ merge_artif_net_flux_by_admin_level("epci") }}
