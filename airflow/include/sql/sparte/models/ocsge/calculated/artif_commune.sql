{{
    config(
        materialized='table',
        indexes=[
            {'columns': ['commune'], 'type': 'btree'},
            {'columns': ['departement'], 'type': 'btree'},
            {'columns': ['region'], 'type': 'btree'},
            {'columns': ['epci'], 'type': 'btree'},
            {'columns': ['ept'], 'type': 'btree'},
            {'columns': ['scot'], 'type': 'btree'},
        ],
    )
}}


with without_percent as (
SELECT
    commune,
    departement,
    region,
    epci,
    ept,
    scot,
    count(land_zonage.zonage_checksum) as zonage_count,
    sum(zonage_couverture_et_usage.surface) as surface,
    sum(
        CASE
            zonage_couverture_et_usage.is_artificial
            WHEN true THEN zonage_couverture_et_usage.surface
            ELSE 0
        END
    ) as artificial_surface,
    zonage_type,
    year
FROM
    {{ ref('commune_zonage') }} as land_zonage
LEFT JOIN
    {{ ref("zonage_couverture_et_usage")}}
ON
    land_zonage.zonage_checksum = zonage_couverture_et_usage.zonage_checksum
WHERE
    zonage_type IS NOT NULL
GROUP BY
    commune,
    zonage_type,
    year,
    departement,
    region,
    epci,
    ept,
    scot
)
SELECT
    commune,
    departement,
    region,
    epci,
    ept,
    scot,
    year,
    surface,
    artificial_surface,
    zonage_type,
    zonage_count,
    artificial_surface / surface * 100 as artificial_percent
FROM
    without_percent
