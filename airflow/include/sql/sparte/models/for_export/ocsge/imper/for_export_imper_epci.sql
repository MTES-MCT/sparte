{{ config(materialized="table") }}

SELECT
    flux.code as epci_code,
    epci.name as nom,
    stock.percent as pourcent_imper,
    stock.surface as surface_imper,
    flux.flux_imper,
    flux.flux_desimper,
    flux.flux_imper_net,
    flux.year_old as millesime_debut,
    flux.year_new as millesime_fin,
    ST_Transform(epci.simple_geom, 4326) as geom
FROM {{ ref("imper_net_flux_epci") }} as flux
LEFT JOIN {{ ref("imper_epci") }} as stock
    ON flux.code = stock.code
    AND flux.year_new = stock.year
LEFT JOIN {{ ref("epci") }} as epci ON flux.code = epci.code
WHERE {{ exclude_guyane_incomplete_lands("flux.code", "EPCI") }}
