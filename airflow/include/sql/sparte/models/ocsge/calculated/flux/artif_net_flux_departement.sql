{{
    config(
        materialized="table",
        indexes=[{"columns": ["departement"], "type": "btree"}],
    )
}}

{{ merge_artif_net_flux_by_admin_level("departement") }}
