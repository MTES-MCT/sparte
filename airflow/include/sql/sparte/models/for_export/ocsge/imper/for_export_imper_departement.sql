{{ config(materialized="table") }}

SELECT
    flux.code as departement_code,
    departement.name as nom,
    departement.region as region_code,
    stock.percent as pourcent_imper,
    stock.surface as surface_imper,
    flux.flux_imper,
    flux.flux_desimper,
    flux.flux_imper_net,
    flux.year_old as millesime_debut,
    flux.year_new as millesime_fin,
    ST_Transform(departement.simple_geom, 4326) as geom
FROM {{ ref("imper_net_flux_departement") }} as flux
LEFT JOIN {{ ref("imper_departement") }} as stock
    ON flux.code = stock.code
    AND flux.year_new = stock.year
LEFT JOIN {{ ref("departement") }} as departement ON flux.code = departement.code
WHERE {{ exclude_guyane_incomplete_lands("flux.code", "DEPARTEMENT") }}
