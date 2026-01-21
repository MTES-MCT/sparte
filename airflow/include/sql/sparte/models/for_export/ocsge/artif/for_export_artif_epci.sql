{{ config(materialized="table") }}

SELECT
    flux.code as epci_code,
    epci.name as nom,
    stock.percent as pourcent_artif,
    stock.surface as surface_artif,
    flux.flux_artif,
    flux.flux_desartif,
    flux.flux_artif_net,
    flux.year_old as millesime_debut,
    flux.year_new as millesime_fin,
    ST_Transform(epci.simple_geom, 4326) as geom
FROM {{ ref("artif_net_flux_epci") }} as flux
LEFT JOIN {{ ref("artif_epci") }} as stock
    ON flux.code = stock.code
    AND flux.year_new = stock.year
LEFT JOIN {{ ref("epci") }} as epci ON flux.code = epci.code
WHERE {{ exclude_guyane_incomplete_lands("flux.code", "EPCI") }}
