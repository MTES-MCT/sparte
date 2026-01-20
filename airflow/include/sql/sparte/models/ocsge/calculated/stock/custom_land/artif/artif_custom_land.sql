{{
    config(
        materialized="table",
        indexes=[{"columns": ["code"], "type": "btree"}],
    )
}}

with without_percent as (
SELECT
    clc.custom_land_id as code,
    artif_commune.year,
    sum(artif_commune.surface) as surface,
    sum(artif_commune.land_surface) as land_surface,
    artif_commune.departement,
    artif_commune.index
FROM
    {{ ref('artif_commune') }}
INNER JOIN
    {{ ref('commune_custom_land') }} clc
    ON artif_commune.code = clc.commune_code
WHERE
    clc.custom_land_id IS NOT NULL
GROUP BY
    clc.custom_land_id, year, artif_commune.departement, artif_commune.index
)
SELECT
    *,
    surface / land_surface * 100 as percent
FROM without_percent
