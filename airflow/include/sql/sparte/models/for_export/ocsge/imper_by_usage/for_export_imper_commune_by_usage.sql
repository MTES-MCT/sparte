{{ config(materialized="table") }}

SELECT
    flux.commune_code,
    commune.name as nom,
    flux.usage as code_usage,
    stock.surface as surface_stock,
    stock.percent_of_indicateur as pourcent_stock,
    flux.flux_imper,
    flux.flux_desimper,
    flux.flux_imper_net,
    flux.year_old as millesime_debut,
    flux.year_new as millesime_fin,
    commune.departement as departement_code,
    commune.region as region_code,
    commune.epci as epci_code,
    commune.scot as scot_code
FROM {{ ref("imper_flux_commune_by_usage") }} as flux
LEFT JOIN {{ ref("imper_commune_by_usage") }} as stock
    ON flux.commune_code = stock.code
    AND flux.year_new = stock.year
    AND flux.usage = stock.usage
LEFT JOIN {{ ref("commune") }} as commune ON flux.commune_code = commune.code
WHERE {{ exclude_guyane_incomplete_lands("flux.commune_code", "COMMUNE") }}
