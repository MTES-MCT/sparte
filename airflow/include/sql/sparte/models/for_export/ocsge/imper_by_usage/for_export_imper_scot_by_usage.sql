{{ config(materialized="table") }}

SELECT
    flux.code as scot_code,
    scot.nom_scot as nom,
    flux.usage as code_usage,
    stock.surface as surface_stock,
    stock.percent_of_indicateur as pourcent_stock,
    flux.flux_imper,
    flux.flux_desimper,
    flux.flux_imper_net,
    flux.year_old as millesime_debut,
    flux.year_new as millesime_fin
FROM {{ ref("imper_flux_scot_by_usage") }} as flux
LEFT JOIN {{ ref("imper_scot_by_usage") }} as stock
    ON flux.code = stock.code
    AND flux.year_new = stock.year
    AND flux.usage = stock.usage
LEFT JOIN {{ ref("scot") }} as scot ON flux.code = scot.id_scot
WHERE {{ exclude_guyane_incomplete_lands("flux.code", "SCOT") }}
