{{
    config(
        materialized="table",
        indexes=[{"columns": ["commune_code"], "type": "btree"}],
    )
}}

SELECT
    COALESCE(artif.commune_code, desartif.commune_code) as commune_code,
    COALESCE(artificial_surface, 0) as artificial_surface,
    COALESCE(desartif_surface, 0) as desartif_surface,
    COALESCE(artificial_surface, 0) - COALESCE(desartif_surface, 0) as artif_net,
    COALESCE(artif.year_old, desartif.year_old) as year_old,
    COALESCE(artif.year_new, desartif.year_new) as year_new

FROM {{ ref('artif_flux_commune') }} as artif
LEFT JOIN
    {{ ref('desartif_flux_commune') }} as desartif
ON artif.commune_code = desartif.commune_code
AND artif.year_old = desartif.year_old
AND artif.year_new = desartif.year_new
