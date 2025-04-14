{{ config(materialized="table", docs={"node_color": "purple"}) }}


SELECT
    artif_land_by_usage.land_id,
    artif_land_by_usage.land_type,
    artif_land_by_usage.departement,
    artif_land_by_usage.year,
    percent_of_land,
    artificial_surface as surface,
    usage,
    percent_of_artif,
    artif_land_by_usage.index as millesime_index
FROM
    {{ ref("artif_land_by_usage") }}
