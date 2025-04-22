{{ config(materialized="table", docs={"node_color": "purple"}) }}


SELECT
    artif_land_by_couverture.land_id,
    artif_land_by_couverture.land_type,
    artif_land_by_couverture.departement,
    artif_land_by_couverture.year,
    percent_of_land,
    surface,
    couverture,
    percent_of_indicateur as percent_of_artif,
    artif_land_by_couverture.index as millesime_index,
    app_couverturesol.map_color as color,
    app_couverturesol.label_short as label_short,
    app_couverturesol.label as label
FROM
    {{ ref("artif_land_by_couverture") }}
LEFT JOIN
    {{ ref("couverture") }} as app_couverturesol
ON
    artif_land_by_couverture.couverture = app_couverturesol.code_prefix
