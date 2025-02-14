{{
    config(
        materialized="table",
        indexes=[{"columns": ["scot"], "type": "btree"}],
    )
}}

{{ merge_artif_net_flux_by_admin_level("scot") }}
