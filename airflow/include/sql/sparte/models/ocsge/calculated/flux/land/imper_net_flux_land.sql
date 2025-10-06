
{{
    config(
        materialized="table",
        indexes=[
            {"columns": ["land_id", "land_type"], "type": "btree"},
            {"columns": ["departement"], "type": "btree"},
        ],
    )
}}

{% set common_fields = [
    "year_old",
    "year_new",
    "year_old_index",
    "year_new_index",
    "flux_imper",
    "flux_desimper",
    "flux_imper_net",
    "departement",
] %}

SELECT
    commune_code as land_id,
    '{{ var('COMMUNE')}}' AS land_type,
    {{ common_fields | join(", ") }}
FROM
    {{ ref('imper_net_flux_commune')}}
UNION ALL
SELECT
    code as land_id,
    '{{ var('EPCI')}}' AS land_type,
    {{ common_fields | join(", ") }}
FROM
    {{ ref('imper_net_flux_epci')}}
UNION ALL
SELECT
    code as land_id,
    '{{ var('DEPARTEMENT')}}' AS land_type,
   {{ common_fields | join(", ") }}
FROM
    {{ ref('imper_net_flux_departement')}}
UNION ALL
SELECT
    code as land_id,
    '{{ var('REGION')}}' AS land_type,
    {{ common_fields | join(", ") }}
FROM
    {{ ref('imper_net_flux_region')}}
UNION ALL
SELECT
    code as land_id,
    '{{ var('SCOT')}}' AS land_type,
   {{ common_fields | join(", ") }}
FROM
    {{ ref('imper_net_flux_scot')}}
