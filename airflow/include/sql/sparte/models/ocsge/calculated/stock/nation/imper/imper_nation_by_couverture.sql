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
        couverture,
        sum(surface) as surface,
        departement,
        index
    FROM
        {{ ref('imper_region_by_couverture') }}
    GROUP BY
        couverture, year, departement, index
)
SELECT
    without_percent.code,
    without_percent.departement,
    without_percent.index,
    without_percent.year,
    without_percent.surface / imper_nation.land_surface * 100 as percent_of_land,
    without_percent.surface as surface,
    without_percent.couverture,
    (100 * without_percent.surface) / imper_nation.surface as percent_of_indicateur
FROM without_percent
LEFT JOIN
    {{ ref('imper_nation') }} as imper_nation
    ON without_percent.year = imper_nation.year
    AND without_percent.departement = imper_nation.departement
