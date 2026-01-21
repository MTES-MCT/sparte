{{ config(materialized="table") }}

SELECT
    flux.code as scot_code,
    scot.nom_scot as nom,
    stock.percent as pourcent_artif,
    stock.surface as surface_artif,
    flux.flux_artif,
    flux.flux_desartif,
    flux.flux_artif_net,
    flux.year_old as millesime_debut,
    flux.year_new as millesime_fin,
    ST_Transform(scot.simple_geom, 4326) as geom
FROM {{ ref("artif_net_flux_scot") }} as flux
LEFT JOIN {{ ref("artif_scot") }} as stock
    ON flux.code = stock.code
    AND flux.year_new = stock.year
LEFT JOIN {{ ref("scot") }} as scot ON flux.code = scot.id_scot
WHERE {{ exclude_guyane_incomplete_lands("flux.code", "SCOT") }}
