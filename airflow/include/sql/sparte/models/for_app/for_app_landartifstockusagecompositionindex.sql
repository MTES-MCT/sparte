{{ config(materialized="table", docs={"node_color": "purple"}) }}


SELECT
    land_id,
    land_type,
    departements,
    years,
    percent_of_land,
    surface,
    usage,
    percent_of_indicateur as percent_of_artif,
    index as millesime_index,
    app_usagesol.map_color as color,
    app_usagesol.label_short as label_short,
    app_usagesol.label as label
FROM
    {{ ref("artif_land_by_usage_by_index") }}
LEFT JOIN
    {{ ref("app_usagesol") }}
ON
    artif_land_by_usage_by_index.usage = app_usagesol.code_prefix
