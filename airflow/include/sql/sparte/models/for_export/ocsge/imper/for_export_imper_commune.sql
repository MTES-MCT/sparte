{{ config(materialized="table") }}

SELECT
    flux.commune_code,
    commune.name as nom,
    stock.percent as pourcent_imper,
    stock.surface as surface_imper,
    flux.flux_imper,
    flux.flux_desimper,
    flux.flux_imper_net,
    flux.year_old as millesime_debut,
    flux.year_new as millesime_fin,
    commune.departement as departement_code,
    commune.region as region_code,
    commune.epci as epci_code,
    commune.scot as scot_code,
    commune.surface as commune_surface,
    ST_Transform(commune.simple_geom, 4326) as geom
FROM {{ ref("imper_net_flux_commune") }} as flux
LEFT JOIN {{ ref("imper_commune") }} as stock
    ON flux.commune_code = stock.code
    AND flux.year_new = stock.year
LEFT JOIN {{ ref("commune") }} as commune ON flux.commune_code = commune.code
WHERE {{ exclude_guyane_incomplete_lands("flux.commune_code", "COMMUNE") }}
