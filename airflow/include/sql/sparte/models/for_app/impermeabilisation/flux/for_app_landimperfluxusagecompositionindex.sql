{{ config(materialized="table", docs={"node_color": "purple"}) }}

SELECT
    land_id,
    land_type,
    departements,
    years_old,
    years_new,
    year_old_index as millesime_old_index,
    year_new_index as millesime_new_index,
    usage,
    app_usagesol.map_color as color,
    app_usagesol.label_short as label_short,
    app_usagesol.label as label,
    {{ m2_to_ha('flux_imper') }} as flux_imper,
    {{ m2_to_ha('flux_desimper') }} as flux_desimper,
    {{ m2_to_ha('flux_imper_net') }} as flux_imper_net
FROM
    {{ ref('imper_flux_land_by_usage_by_index') }}
LEFT JOIN
    {{ ref("usage") }} as app_usagesol
ON
    imper_flux_land_by_usage_by_index.usage = app_usagesol.code_prefix
