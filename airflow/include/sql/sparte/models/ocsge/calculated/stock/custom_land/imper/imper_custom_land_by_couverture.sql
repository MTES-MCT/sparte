{{
    config(
        materialized="table",
        indexes=[{"columns": ["code"], "type": "btree"}],
    )
}}

with without_percent as (
    SELECT
        clc.custom_land_id as code,
        year,
        couverture,
        sum(imper_commune_by_couverture.surface) as surface,
        sum(commune.surface) as land_surface,
        commune.departement,
        imper_commune_by_couverture.index
    FROM
        {{ ref('imper_commune_by_couverture') }}
    INNER JOIN
        {{ ref('commune_custom_land') }} clc
        ON imper_commune_by_couverture.code = clc.commune_code
    LEFT JOIN
        {{ ref('commune') }}
        ON imper_commune_by_couverture.code = commune.code
    WHERE
        clc.custom_land_id IS NOT NULL
    GROUP BY
        clc.custom_land_id, couverture, year, commune.departement, imper_commune_by_couverture.index
)
SELECT
    without_percent.code,
    without_percent.departement,
    without_percent.index,
    without_percent.year,
    without_percent.surface / without_percent.land_surface * 100 as percent_of_land,
    without_percent.surface as surface,
    without_percent.couverture,
    (100 * without_percent.surface) / imper_custom_land.surface as percent_of_indicateur
FROM without_percent
LEFT JOIN
    {{ ref('imper_custom_land') }} as imper_custom_land
    ON without_percent.code = imper_custom_land.code
    AND without_percent.year = imper_custom_land.year
    AND without_percent.departement = imper_custom_land.departement
