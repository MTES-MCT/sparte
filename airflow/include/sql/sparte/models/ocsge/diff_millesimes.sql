{{
    config(
        materialized="table",
        indexes=[
            {"columns": ["year_old"], "type": "btree"},
            {"columns": ["year_new"], "type": "btree"},
            {"columns": ["departement"], "type": "btree"},
            {"columns": ["year_old", "departement"], "type": "btree"},
            {"columns": ["year_new", "departement"], "type": "btree"},
            {"columns": ["year_old", "year_new"], "type": "btree"},
            {"columns": ["year_old", "year_new", "departement"], "type": "btree"},
        ]
    )
}}

SELECT DISTINCT departement, year_old, year_new FROM {{ ref('difference') }}
