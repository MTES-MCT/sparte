{{ config(materialized="table", docs={"node_color": "purple"}) }}


SELECT
    imper_land_by_couverture.land_id,
    imper_land_by_couverture.land_type,
    imper_land_by_couverture.departement,
    imper_land_by_couverture.year,
    percent_of_land,
    {{ m2_to_ha('surface') }} as surface,
    couverture,
    percent_of_indicateur as percent_of_imper,
    imper_land_by_couverture.index as millesime_index,
    app_couverturesol.map_color as color,
    app_couverturesol.label_short as label_short,
    app_couverturesol.label as label
FROM
    {{ ref("imper_land_by_couverture") }}
LEFT JOIN
    {{ ref("couverture") }} as app_couverturesol
ON
    imper_land_by_couverture.couverture = app_couverturesol.code_prefix
