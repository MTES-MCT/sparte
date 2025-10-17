
{{
    config(
        materialized="table",
        indexes=[
            {"columns": ["land_id", "land_type"], "type": "btree"},
            {"columns": ["couverture"], "type": "btree"},
        ],
    )
}}


{% set common_fields = [
    "departement",
    "year_old",
    "year_new",
    "year_old_index",
    "year_new_index",
    "couverture",
    "flux_artif",
    "flux_desartif",
    "flux_artif_net",
] %}


SELECT
    commune_code as land_id,
    '{{ var('COMMUNE') }}' as land_type,
    {{ common_fields | join(", ") }}

FROM {{ ref('artif_flux_commune_by_couverture') }}
UNION ALL
SELECT
    code as land_id,
    '{{ var('EPCI') }}' as land_type,
    {{ common_fields | join(", ") }}
FROM {{ ref('artif_flux_epci_by_couverture') }}
UNION ALL
SELECT
    code as land_id,
    '{{ var('DEPARTEMENT') }}' as land_type,
    {{ common_fields | join(", ") }}
FROM {{ ref('artif_flux_departement_by_couverture') }}
UNION ALL
SELECT
    code as land_id,
    '{{ var('REGION') }}' as land_type,
    {{ common_fields | join(", ") }}
FROM {{ ref('artif_flux_region_by_couverture') }}
UNION ALL
SELECT
    code as land_id,
    '{{ var('SCOT') }}' as land_type,
    {{ common_fields | join(", ") }}
FROM {{ ref('artif_flux_scot_by_couverture') }}
