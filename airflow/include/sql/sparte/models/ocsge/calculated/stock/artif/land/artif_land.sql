{{
    config(
        materialized="table",
        indexes=[
            {"columns": ["land_id"], "type": "btree"},
            {"columns": ["land_type"], "type": "btree"},
            {"columns": ["year"], "type": "btree"},
        ],
    )
}}


{% set common_fields = "year, percent, artificial_surface, surface, departement, index" %}
SELECT
    code as land_id,
    '{{ var("COMMUNE") }}' as land_type,
    {{ common_fields }}
FROM
    {{ ref("artif_commune") }}
UNION ALL
SELECT
    code as land_id,
    '{{ var("EPCI") }}' as land_type,
    {{ common_fields }}
FROM
    {{ ref("artif_epci") }}
UNION ALL
SELECT
    code as land_id,
    '{{ var("SCOT") }}' as land_type,
    {{ common_fields }}
FROM
    {{ ref("artif_scot") }}
UNION ALL
SELECT
    code as land_id,
    '{{ var("DEPARTEMENT") }}' as land_type,
    {{ common_fields }}
FROM
    {{ ref("artif_departement") }}
UNION ALL
SELECT
    code as land_id,
    '{{ var("REGION") }}' as land_type,
    {{ common_fields }}
FROM
    {{ ref("artif_region") }}
