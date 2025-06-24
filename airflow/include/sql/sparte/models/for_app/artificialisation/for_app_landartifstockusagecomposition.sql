{{ config(materialized="table", docs={"node_color": "purple"}) }}


SELECT
    artif_land_by_usage.land_id,
    artif_land_by_usage.land_type,
    artif_land_by_usage.departement,
    artif_land_by_usage.year,
    percent_of_land,
    {{ m2_to_ha('surface') }} as surface,
    usage,
    percent_of_indicateur as percent_of_artif,
    artif_land_by_usage.index as millesime_index,
    app_usagesol.map_color as color,
    app_usagesol.label_short as label_short,
    app_usagesol.label as label
FROM
    {{ ref("artif_land_by_usage") }}
LEFT JOIN
    {{ ref("usage") }} as app_usagesol
ON
    artif_land_by_usage.usage = app_usagesol.code_prefix
