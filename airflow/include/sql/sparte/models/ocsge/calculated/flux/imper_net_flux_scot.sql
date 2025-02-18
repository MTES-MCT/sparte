{{
    config(
        materialized="table",
        indexes=[{"columns": ["scot"], "type": "btree"}],
    )
}}

{{ merge_imper_net_flux_by_admin_level("scot") }}
