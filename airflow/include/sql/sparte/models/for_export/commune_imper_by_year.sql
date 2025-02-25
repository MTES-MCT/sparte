{{ config(materialized='table') }}

with latest_imper_commune as (
    SELECT distinct commune_code, percent, surface, year
    FROM {{ ref('imper_commune') }} as imper
    ORDER BY year DESC
)
SELECT
    latest_imper_commune.commune_code,
    commune.name as nom,
    latest_imper_commune.percent as pourcent_imper,
    latest_imper_commune.surface as surface_imper,
    latest_imper_commune.year as ocsge_millesime,
    commune.population as population,
    commune.canton as canton,
    commune.departement as departement,
    commune.region as region,
    commune.ept as ept,
    commune.epci as epci,
    commune.scot as scot,
    commune.surface as commune_surface,
    ST_Transform(commune.geom, 4326) as geom
FROM latest_imper_commune
LEFT JOIN {{ ref('commune') }} as commune
ON latest_imper_commune.commune_code = commune.code
