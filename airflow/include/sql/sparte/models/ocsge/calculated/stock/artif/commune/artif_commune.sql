{{
    config(
        materialized="table",
        indexes=[{"columns": ["code"], "type": "btree"}],
    )
}}

with without_commune_surface as (
SELECT
    commune_code as code,
    year,
    sum(percent) as percent,
    sum(surface) as artificial_surface,
    departement,
    index
FROM
    {{ ref('commune_couverture_et_usage')}}
WHERE
    is_artificial
group by
    commune_code, year, departement, index
)

SELECT
    without_commune_surface.code,
    without_commune_surface.year,
    without_commune_surface.percent,
    without_commune_surface.artificial_surface,
    commune.surface as surface,
    without_commune_surface.departement,
    without_commune_surface.index
FROM
    without_commune_surface
LEFT JOIN
    {{ ref('commune') }}
    ON commune.code = without_commune_surface.code
