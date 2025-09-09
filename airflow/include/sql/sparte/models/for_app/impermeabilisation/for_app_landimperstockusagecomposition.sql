{{ config(materialized="table", docs={"node_color": "purple"}) }}


SELECT
    imper_land_by_usage.land_id,
    imper_land_by_usage.land_type,
    imper_land_by_usage.departement,
    imper_land_by_usage.year,
    percent_of_land,
    {{ m2_to_ha('surface') }} as surface,
    usage,
    percent_of_indicateur as percent_of_imper,
    imper_land_by_usage.index as millesime_index,
    app_usagesol.map_color as color,
    app_usagesol.label_short as label_short,
    app_usagesol.label as label
FROM
    {{ ref("imper_land_by_usage") }}
LEFT JOIN
    {{ ref("usage") }} as app_usagesol
ON
    imper_land_by_usage.usage = app_usagesol.code_prefix
