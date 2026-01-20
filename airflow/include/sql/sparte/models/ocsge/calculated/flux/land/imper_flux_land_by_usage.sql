
{{
    config(
        materialized="table",
        indexes=[
            {"columns": ["land_id", "land_type"], "type": "btree"},
            {"columns": ["usage"], "type": "btree"},
        ],
    )
}}


{% set common_fields = [
    "departement",
    "year_old",
    "year_new",
    "year_old_index",
    "year_new_index",
    "usage",
    "flux_imper",
    "flux_desimper",
    "flux_imper_net",
] %}


SELECT
    commune_code as land_id,
    '{{ var('COMMUNE') }}' as land_type,
    {{ common_fields | join(", ") }}

FROM {{ ref('imper_flux_commune_by_usage') }}
UNION ALL
SELECT
    code as land_id,
    '{{ var('EPCI') }}' as land_type,
    {{ common_fields | join(", ") }}
FROM {{ ref('imper_flux_epci_by_usage') }}
UNION ALL
SELECT
    code as land_id,
    '{{ var('DEPARTEMENT') }}' as land_type,
    {{ common_fields | join(", ") }}
FROM {{ ref('imper_flux_departement_by_usage') }}
UNION ALL
SELECT
    code as land_id,
    '{{ var('REGION') }}' as land_type,
    {{ common_fields | join(", ") }}
FROM {{ ref('imper_flux_region_by_usage') }}
UNION ALL
SELECT
    code as land_id,
    '{{ var('SCOT') }}' as land_type,
    {{ common_fields | join(", ") }}
FROM {{ ref('imper_flux_scot_by_usage') }}
UNION ALL
SELECT
    code as land_id,
    '{{ var('CUSTOM') }}' as land_type,
    {{ common_fields | join(", ") }}
FROM {{ ref('imper_flux_custom_land_by_usage') }}
