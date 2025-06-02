{{ config(materialized="table", docs={"node_color": "purple"}) }}


SELECT
    land_id,
    land_type,
    departements,
    years,
    percent_of_land,
    {{ m2_to_ha('surface') }} as surface,
    couverture,
    percent_of_indicateur as percent_of_artif,
    index as millesime_index,
    app_couverturesol.map_color as color,
    app_couverturesol.label_short as label_short,
    app_couverturesol.label as label
FROM
    {{ ref("artif_land_by_couverture_by_index") }}
LEFT JOIN
    {{ ref("couverture") }} as app_couverturesol
ON
    artif_land_by_couverture_by_index.couverture = app_couverturesol.code_prefix
