{{
    config(
        materialized="table",
        indexes=[{"columns": ["region"], "type": "btree"}],
    )
}}

{{ merge_artif_net_flux_by_admin_level("region") }}
