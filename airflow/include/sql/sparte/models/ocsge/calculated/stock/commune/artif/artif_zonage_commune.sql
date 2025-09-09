{{
    config(
        materialized="table",
        indexes=[
            {"columns": ["code"], "type": "btree"},
            {"columns": ["departement"], "type": "btree"},
            {"columns": ["region"], "type": "btree"},
            {"columns": ["epci"], "type": "btree"},
            {"columns": ["ept"], "type": "btree"},
            {"columns": ["scot"], "type": "btree"},
        ],
    )
}}


{{ merge_ocsge_zonage_commune('is_artificial') }}
