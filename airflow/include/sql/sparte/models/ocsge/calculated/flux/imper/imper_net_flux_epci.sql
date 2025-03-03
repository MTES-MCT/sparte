{{
    config(
        materialized="table",
        indexes=[{"columns": ["epci"], "type": "btree"}],
    )
}}

{{ merge_imper_net_flux_by_admin_level("epci") }}
