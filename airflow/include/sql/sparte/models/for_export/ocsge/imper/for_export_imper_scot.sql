{{ config(materialized="table") }}

SELECT
    flux.code as scot_code,
    scot.nom_scot as nom,
    stock.percent as pourcent_imper,
    stock.surface as surface_imper,
    flux.flux_imper,
    flux.flux_desimper,
    flux.flux_imper_net,
    flux.year_old as millesime_debut,
    flux.year_new as millesime_fin,
    ST_Transform(scot.simple_geom, 4326) as geom
FROM {{ ref("imper_net_flux_scot") }} as flux
LEFT JOIN {{ ref("imper_scot") }} as stock
    ON flux.code = stock.code
    AND flux.year_new = stock.year
LEFT JOIN {{ ref("scot") }} as scot ON flux.code = scot.id_scot
WHERE {{ exclude_guyane_incomplete_lands("flux.code", "SCOT") }}
