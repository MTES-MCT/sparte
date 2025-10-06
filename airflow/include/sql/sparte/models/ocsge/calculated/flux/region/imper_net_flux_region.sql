{{
    config(
        materialized="table",
        indexes=[{"columns": ["code"], "type": "btree"}],
    )
}}

{{ merge_imper_net_flux_by_admin_level("region") }}
