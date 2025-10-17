{{ config(materialized="table", docs={"node_color": "purple"}) }}

SELECT
    land_id,
    land_type,
    departement,
    year_old,
    year_new,
    year_old_index as millesime_old_index,
    year_new_index as millesime_new_index,
    couverture,
    app_couverturesol.map_color as color,
    app_couverturesol.label_short as label_short,
    app_couverturesol.label as label,
    {{ m2_to_ha('flux_artif') }} as flux_artif,
    {{ m2_to_ha('flux_desartif') }} as flux_desartif,
    {{ m2_to_ha('flux_artif_net') }} as flux_artif_net
FROM
    {{ ref('artif_flux_land_by_couverture') }}
LEFT JOIN
    {{ ref("couverture") }} as app_couverturesol
ON
    artif_flux_land_by_couverture.couverture = app_couverturesol.code_prefix
