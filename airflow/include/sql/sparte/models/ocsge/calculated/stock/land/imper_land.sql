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
    {{ ref("imper_commune") }}
UNION ALL
SELECT
    code as land_id,
    '{{ var("EPCI") }}' as land_type,
    {{ common_fields }}
FROM
    {{ ref("imper_epci") }}
UNION ALL
SELECT
    code as land_id,
    '{{ var("SCOT") }}' as land_type,
    {{ common_fields }}
FROM
    {{ ref("imper_scot") }}
UNION ALL
SELECT
    code as land_id,
    '{{ var("DEPARTEMENT") }}' as land_type,
    {{ common_fields }}
FROM
    {{ ref("imper_departement") }}
UNION ALL
SELECT
    code as land_id,
    '{{ var("REGION") }}' as land_type,
    {{ common_fields }}
FROM
    {{ ref("imper_region") }}
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
    without_flux as imper_land
    LEFT JOIN LATERAL (
        SELECT
            imper_land.surface - surface as flux_surface,
            imper_land.percent - percent as flux_percent,
            year as flux_year
        FROM
            without_flux
        WHERE
            land_id = imper_land.land_id and
            land_type = imper_land.land_type and
            departement = imper_land.departement and
            index = imper_land.index - 1
    ) as flux on true
ORDER BY
land_id
