{{
    config(
        materialized="table",
        indexes=[{"columns": ["departement"], "type": "btree"}],
    )
}}

{{ merge_imper_net_flux_by_admin_level("departement") }}
