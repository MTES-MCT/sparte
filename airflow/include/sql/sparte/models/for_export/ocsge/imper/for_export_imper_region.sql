{{ config(materialized="table") }}

SELECT
    stock.code as region_code,
    region.name as nom,
    stock.percent as pourcent_imper,
    stock.surface as surface_imper,
    stock.year as millesime,
    ST_Transform(region.simple_geom, 4326) as geom
FROM {{ ref("imper_region") }} as stock
LEFT JOIN {{ ref("region") }} as region ON stock.code = region.code
WHERE {{ exclude_guyane_incomplete_lands("stock.code", "REGION") }}
