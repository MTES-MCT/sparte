{{ config(materialized="table") }}

{% set couvertures = ['CS1.1.1.1', 'CS1.1.1.2'] %}

SELECT
    stock.land_id as commune_code,
    commune.name as nom,
    max(CASE WHEN stock.index = 1 THEN array_to_string(stock.years, ', ') END) as millesimes_1,
    max(CASE WHEN stock.index = 2 THEN array_to_string(stock.years, ', ') END) as millesimes_2,

    {{ for_export_pivot_columns('imper', 'couverture', couvertures, has_trailing_columns=true) }}
    commune.departement as departement_code,
    commune.region as region_code,
    commune.epci as epci_code,
    commune.scot as scot_code
FROM {{ ref("imper_land_by_couverture_by_index") }} as stock
LEFT JOIN {{ ref("imper_flux_land_by_couverture_by_index") }} as flux
    ON stock.land_id = flux.land_id
    AND stock.land_type = flux.land_type
    AND stock.couverture = flux.couverture
    AND flux.year_old_index = 1
    AND flux.year_new_index = 2
LEFT JOIN {{ ref("commune") }} as commune ON stock.land_id = commune.code
WHERE stock.land_type = '{{ var("COMMUNE") }}'
AND {{ exclude_guyane_incomplete_lands("stock.land_id", "COMMUNE") }}
GROUP BY stock.land_id, commune.name, commune.departement, commune.region, commune.epci, commune.scot
