{{ config(materialized="table") }}

{% set couvertures = dbt_utils.get_column_values(table=ref('couverture'), column='code_prefix') %}

SELECT
    stock.land_id as region_code,
    region.name as nom,
    max(CASE WHEN stock.index = 1 THEN array_to_string(stock.years, ', ') END) as millesimes_1,
    max(CASE WHEN stock.index = 2 THEN array_to_string(stock.years, ', ') END) as millesimes_2,

    {{ for_export_pivot_columns('artif', 'couverture', couvertures) }}
FROM {{ ref("artif_land_by_couverture_by_index") }} as stock
LEFT JOIN {{ ref("artif_flux_land_by_couverture_by_index") }} as flux
    ON stock.land_id = flux.land_id
    AND stock.land_type = flux.land_type
    AND stock.couverture = flux.couverture
    AND flux.year_old_index = 1
    AND flux.year_new_index = 2
LEFT JOIN {{ ref("region") }} as region ON stock.land_id = region.code
WHERE stock.land_type = '{{ var("REGION") }}'
AND {{ exclude_guyane_incomplete_lands("stock.land_id", "REGION") }}
GROUP BY stock.land_id, region.name
