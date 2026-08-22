{{
    config(
        materialized="table",
        indexes=[
            {"columns": ["id"], "type": "btree"},
            {"columns": ["code"], "type": "btree"},
            {"columns": ["name"], "type": "btree"},
            {"columns": ["departement"], "type": "btree"},
            {"columns": ["region"], "type": "btree"},
            {"columns": ["epci"], "type": "btree"},
            {"columns": ["scot"], "type": "btree"},
            {"columns": ["geom"], "type": "gist"},
            {"columns": ["geom_4326"], "type": "gist"},
        ],
    )
}}
SELECT
    commune_sans_scot.*,
    scot_communes.id_scot as scot
FROM
    {{ ref('commune_sans_scot') }} as commune_sans_scot
LEFT JOIN
    {{ ref('scot_communes') }} as scot_communes
ON
    commune_sans_scot.code = scot_communes.commune_code
