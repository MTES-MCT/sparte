{{
    config(
        materialized="table",
        indexes=[{"columns": ["code"], "type": "btree"}],
    )
}}

with without_percent as (
SELECT
    '{{ var("NATION") }}' as code,
    year,
    sum(surface) as surface,
    sum(land_surface) as land_surface,
    departement,
    index
FROM
    {{ ref('artif_region') }}
GROUP BY
    year, departement, index
)
SELECT
    *,
    surface / land_surface * 100 as percent
FROM without_percent
