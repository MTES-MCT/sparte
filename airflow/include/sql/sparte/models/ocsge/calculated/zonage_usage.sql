{{
    config(
        materialized='table',
        indexes=[{'columns': ['zonage_checksum'], 'type': 'btree'}],
    )
}}

with without_percent as (
SELECT
    zonage_checksum,
    zonage_surface,
    zonage_libelle,
    year,
    round(sum(st_area(st_transform(geom, srid_source)))::numeric, 4) AS surface,
    code_us
FROM
    {{ ref('occupation_du_sol_zonage_urbanisme') }}
GROUP BY
    zonage_checksum,
    zonage_surface,
    zonage_libelle,
    code_us,
    year
)
SELECT
    zonage_checksum,
    zonage_surface,
    zonage_libelle,
    year,
    surface,
    code_us,
    surface / zonage_surface * 100 as percent
FROM
    without_percent
