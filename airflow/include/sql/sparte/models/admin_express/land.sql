{{
    config(
        materialized='table',
        indexes=[
            {'columns': ['land_id'], 'type': 'btree'},
            {'columns': ['land_type'], 'type': 'btree'},
            {'columns': ['geom'], 'type': 'gist'}
        ])
}}


{% set common_fields = "geom, surface" %}
{% set admin_express_common_fields = "name" %}

SELECT
    code as land_id,
    '{{ var("COMMUNE") }}' as land_type,
    string_to_array(departement, '') as departements,
    {{ common_fields }},
    {{ admin_express_common_fields }}
FROM
    {{ ref('commune') }}
UNION ALL
SELECT
    code as land_id,
    '{{ var("EPCI") }}' as land_type,
    (SELECT array_agg(distinct departement) FROM {{ ref('commune') }} WHERE "epci" = epci.code) as departements,
    {{ common_fields }},
    {{ admin_express_common_fields }}
FROM
    {{ ref('epci') }}
UNION ALL
SELECT
    code as land_id,
    '{{ var("DEPARTEMENT") }}' as land_type,
    string_to_array(code, '') as departements,
    {{ common_fields }},
    {{ admin_express_common_fields }}
FROM
    {{ ref('departement') }}
UNION ALL
SELECT
    code as land_id,
    '{{ var("REGION") }}' as land_type,
    (SELECT array_agg(distinct code) FROM {{ ref('departement') }} WHERE "region" = region.code) as departements,
    {{ common_fields }},
    {{ admin_express_common_fields }}
FROM
    {{ ref('region') }}
UNION ALL
SELECT
    id_scot as land_id,
    '{{ var("SCOT") }}' as land_type,
    (SELECT array_agg(distinct departement) FROM {{ ref('commune') }} WHERE "scot" = scot.id_scot) as departements,
    {{ common_fields }},
    nom_scot as name
FROM
    {{ ref('scot') }}

ORDER BY land_type
DESC
