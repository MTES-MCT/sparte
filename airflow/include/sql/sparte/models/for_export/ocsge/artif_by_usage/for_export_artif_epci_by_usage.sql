{{ config(materialized="table") }}

SELECT
    flux.code as epci_code,
    epci.name as nom,
    flux.usage as code_usage,
    stock.surface as surface_stock,
    stock.percent_of_indicateur as pourcent_stock,
    flux.flux_artif,
    flux.flux_desartif,
    flux.flux_artif_net,
    flux.year_old as millesime_debut,
    flux.year_new as millesime_fin
FROM {{ ref("artif_flux_epci_by_usage") }} as flux
LEFT JOIN {{ ref("artif_epci_by_usage") }} as stock
    ON flux.code = stock.code
    AND flux.year_new = stock.year
    AND flux.usage = stock.usage
LEFT JOIN {{ ref("epci") }} as epci ON flux.code = epci.code
WHERE {{ exclude_guyane_incomplete_lands("flux.code", "EPCI") }}
