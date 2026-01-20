{{
    config(
        materialized="table",
        indexes=[{"columns": ["code"], "type": "btree"}],
    )
}}

with without_percent as (
SELECT
    clc.custom_land_id as code,
    imper_commune.year,
    sum(imper_commune.surface) as surface,
    sum(imper_commune.land_surface) as land_surface,
    imper_commune.departement,
    imper_commune.index
FROM
    {{ ref('imper_commune') }}
INNER JOIN
    {{ ref('commune_custom_land') }} clc
    ON imper_commune.code = clc.commune_code
WHERE
    clc.custom_land_id IS NOT NULL
GROUP BY
    clc.custom_land_id, year, imper_commune.departement, imper_commune.index
)
SELECT
    *,
    surface / land_surface * 100 as percent
FROM without_percent
