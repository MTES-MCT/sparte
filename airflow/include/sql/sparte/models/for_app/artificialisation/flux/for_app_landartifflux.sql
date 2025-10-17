{{ config(materialized="table", docs={"node_color": "purple"}) }}

SELECT
    land_id,
    land_type,
    year_old,
    year_new,
    year_old_index as millesime_old_index,
    year_new_index as millesime_new_index,
    {{ m2_to_ha('flux_artif') }} as flux_artif,
    {{ m2_to_ha('flux_desartif') }} as flux_desartif,
    {{ m2_to_ha('flux_artif_net') }} as flux_artif_net,
    departement
FROM {{ ref('artif_net_flux_land')}}
