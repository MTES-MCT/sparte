{{
    config(
        materialized='table',
        indexes=[
            {'columns': ['land_id'], 'type': 'btree'},
            {'columns': ['land_type'], 'type': 'btree'},
            {'columns': ['geom'], 'type': 'gist'}
        ])
}}


{% set common_fields = "geom, simple_geom, surface" %}
{% set admin_express_common_fields = "name" %}

SELECT
    code as land_id,
    '{{ var("COMMUNE") }}' as land_type,
    string_to_array(departement, '') as departements,
    {{ common_fields }},
    {{ admin_express_common_fields }},
    array[]::varchar[] as child_land_types,
    ARRAY[
        '{{ var("EPCI") }}_' || epci,
        '{{ var("DEPARTEMENT") }}_' || departement,
        '{{ var("REGION") }}_' || region,
        '{{ var("NATION") }}_' || '{{ var("NATION") }}',
        '{{ var("SCOT") }}_' || scot
    ] as parent_keys
FROM
    {{ ref('commune') }}
UNION ALL
SELECT
    code as land_id,
    '{{ var("EPCI") }}' as land_type,
    (SELECT array_agg(distinct departement) FROM {{ ref('commune') }} WHERE "epci" = epci.code) as departements,
    {{ common_fields }},
    {{ admin_express_common_fields }},
    string_to_array('{{ var("COMMUNE") }}', '') as child_land_types,
    ARRAY_CAT(
        (SELECT array_agg(distinct '{{ var("DEPARTEMENT") }}_' || departement) FROM {{ ref('commune') }} WHERE "epci" = epci.code),
        (SELECT array_agg(distinct '{{ var("REGION") }}_' || region) FROM {{ ref('commune') }} WHERE "epci" = epci.code)
     ) as parent_keys

FROM
    {{ ref('epci') }}
UNION ALL
SELECT
    code as land_id,
    '{{ var("DEPARTEMENT") }}' as land_type,
    string_to_array(code, '') as departements,
    {{ common_fields }},
    {{ admin_express_common_fields }},
    ARRAY[
        '{{ var("EPCI") }}',
        '{{ var("SCOT") }}'
    ] as child_land_types,
    ARRAY[
        '{{ var("REGION") }}_' || region,
        '{{ var("NATION") }}_' || '{{ var("NATION") }}'
    ] as parent_keys
FROM
    {{ ref('departement') }}
UNION ALL
SELECT
    code as land_id,
    '{{ var("REGION") }}' as land_type,
    (SELECT array_agg(distinct code) FROM {{ ref('departement') }} WHERE "region" = region.code) as departements,
    {{ common_fields }},
    {{ admin_express_common_fields }},
    ARRAY[
        '{{ var("EPCI") }}',
        '{{ var("SCOT") }}',
        '{{ var("DEPARTEMENT") }}'
    ] as child_land_types,
    ARRAY[
        '{{ var("NATION") }}_' || '{{ var("NATION") }}'
    ] as parent_keys

FROM
    {{ ref('region') }}
UNION ALL
SELECT
    id_scot as land_id,
    '{{ var("SCOT") }}' as land_type,
    (SELECT array_agg(distinct departement) FROM {{ ref('commune') }} WHERE "scot" = scot.id_scot) as departements,
    {{ common_fields }},
    nom_scot as name,
    string_to_array('{{ var("COMMUNE") }}', '') as child_land_types,
    ARRAY_CAT(
        (SELECT array_agg(distinct '{{ var("DEPARTEMENT") }}_' || departement) FROM {{ ref('commune') }} WHERE "scot" = scot.id_scot),
        (SELECT array_agg(distinct '{{ var("REGION") }}_' || region) FROM {{ ref('commune') }} WHERE "scot" = scot.id_scot)
    ) as parent_keys
FROM
    {{ ref('scot') }}

ORDER BY land_type
DESC
