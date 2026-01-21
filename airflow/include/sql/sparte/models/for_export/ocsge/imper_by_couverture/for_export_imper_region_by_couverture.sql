{{ config(materialized="table") }}

SELECT
    flux.code as region_code,
    region.name as nom,
    flux.couverture as code_couverture,
    stock.surface as surface_stock,
    stock.percent_of_indicateur as pourcent_stock,
    flux.flux_imper,
    flux.flux_desimper,
    flux.flux_imper_net,
    flux.year_old as millesime_debut,
    flux.year_new as millesime_fin
FROM {{ ref("imper_flux_region_by_couverture") }} as flux
LEFT JOIN {{ ref("imper_region_by_couverture") }} as stock
    ON flux.code = stock.code
    AND flux.year_new = stock.year
    AND flux.couverture = stock.couverture
LEFT JOIN {{ ref("region") }} as region ON flux.code = region.code
WHERE {{ exclude_guyane_incomplete_lands("flux.code", "REGION") }}
