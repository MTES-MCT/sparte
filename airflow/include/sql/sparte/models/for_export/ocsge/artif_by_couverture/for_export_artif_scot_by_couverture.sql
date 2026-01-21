{{ config(materialized="table") }}

SELECT
    flux.code as scot_code,
    scot.nom_scot as nom,
    flux.couverture as code_couverture,
    stock.surface as surface_stock,
    stock.percent_of_indicateur as pourcent_stock,
    flux.flux_artif,
    flux.flux_desartif,
    flux.flux_artif_net,
    flux.year_old as millesime_debut,
    flux.year_new as millesime_fin
FROM {{ ref("artif_flux_scot_by_couverture") }} as flux
LEFT JOIN {{ ref("artif_scot_by_couverture") }} as stock
    ON flux.code = stock.code
    AND flux.year_new = stock.year
    AND flux.couverture = stock.couverture
LEFT JOIN {{ ref("scot") }} as scot ON flux.code = scot.id_scot
WHERE {{ exclude_guyane_incomplete_lands("flux.code", "SCOT") }}
