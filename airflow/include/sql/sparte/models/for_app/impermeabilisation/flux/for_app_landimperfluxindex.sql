{{ config(materialized="table", docs={"node_color": "purple"}) }}


SELECT
    land_id,
    land_type,
    years_old,
    years_new,
    departements,
    year_old_index as millesime_old_index,
    year_new_index as millesime_new_index,
    {{ m2_to_ha('flux_imper') }} as flux_imper,
    {{ m2_to_ha('flux_desimper') }} as flux_desimper,
    {{ m2_to_ha('flux_imper_net') }} as flux_imper_net
FROM
    {{ ref('imper_net_flux_land_by_index') }}
