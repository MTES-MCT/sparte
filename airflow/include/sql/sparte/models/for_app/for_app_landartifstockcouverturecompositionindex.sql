{{ config(materialized="table", docs={"node_color": "purple"}) }}


SELECT
    land_id,
    land_type,
    departements,
    years,
    percent_of_land,
    surface,
    couverture,
    percent_of_indicateur as percent_of_artif,
    index as millesime_index
FROM
    {{ ref("artif_land_by_couverture_by_index") }}
