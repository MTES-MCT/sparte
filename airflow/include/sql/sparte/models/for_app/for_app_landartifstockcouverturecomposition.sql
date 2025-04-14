{{ config(materialized="table", docs={"node_color": "purple"}) }}


SELECT
    artif_land_by_couverture.land_id,
    artif_land_by_couverture.land_type,
    artif_land_by_couverture.departement,
    artif_land_by_couverture.year,
    percent_of_land,
    artificial_surface as surface,
    couverture,
    percent_of_artif,
    artif_land_by_couverture.index as millesime_index
FROM
    {{ ref("artif_land_by_couverture") }}
