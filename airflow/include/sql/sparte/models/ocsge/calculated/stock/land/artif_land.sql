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

with without_flux as (
{% set common_fields = "year, percent, surface, land_surface, departement, index" %}
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
)
SELECT
    land_id,
    land_type,
    year,
    percent,
    surface,
    land_surface,
    departement,
    index,
    flux.flux_surface,
    flux.flux_percent,
    flux.flux_year as flux_previous_year
FROM
    without_flux as artif_land
    LEFT JOIN LATERAL (
        SELECT
            artif_land.surface - surface as flux_surface,
            artif_land.percent - percent as flux_percent,
            year as flux_year
        FROM
            without_flux
        WHERE
            land_id = artif_land.land_id and
            land_type = artif_land.land_type and
            departement = artif_land.departement and
            index = artif_land.index - 1
    ) as flux on true
ORDER BY
land_id
