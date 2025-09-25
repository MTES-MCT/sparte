{{ config(materialized="table", docs={"node_color": "purple"}) }}


SELECT
    imper_land.land_id,
    imper_land.land_type,
    imper_land.departement,
    imper_land.index as millesime_index,
    imper_land.year,
    {{ m2_to_ha('imper_land.surface') }} as surface,
    imper_land.percent,
    {{ m2_to_ha('imper_land.flux_surface') }} as flux_surface,
    imper_land.flux_percent,
    imper_land.flux_previous_year
FROM
    {{ ref("imper_land") }}
