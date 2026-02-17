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
        index,
        departement,
        sum(zonage_surface) as zonage_surface,
        sum(indicateur_surface) as indicateur_surface,
        zonage_type,
        sum(zonage_count) as zonage_count
    FROM
        {{ ref('imper_zonage_region') }}
    GROUP BY
        year, index, zonage_type, departement
)
SELECT
    code,
    year,
    index,
    departement,
    zonage_surface,
    indicateur_surface,
    indicateur_surface / zonage_surface * 100 as indicateur_percent,
    zonage_type,
    zonage_count
FROM without_percent
