{{ config(materialized='table') }}

SELECT
    land_id,
    land_type,
    conso_2011_2020.*,
    conso_since_2021.*,
    conso_2011_2020.allowed_conso_2021_2030 >= conso_since_2021.conso_since_2021 AS currently_respecting_regulation,
    conso_since_2021.conso_since_2021 * 100 / allowed_conso_2021_2030 AS current_percent_use,
    conso_2011_2020.allowed_conso_2021_2030 >= conso_since_2021.projected_conso_2030 AS respecting_regulation_by_2030,
    conso_since_2021.projected_conso_2030 * 100 / allowed_conso_2021_2030 AS projected_percent_use_by_2030

FROM

    {{ ref('land')}}
LEFt JOIN LATERAL (
    SELECT
        total as conso_2011_2020,
        CASE
            WHEN total / 2 < 10000 THEN true
            ELSE false
        END as allowed_conso_raised_to_1ha_2021_2030,
        CASE
            WHEN total / 2 < 10000 THEN 10000
            ELSE total / 2
        END as allowed_conso_2021_2030
    FROM {{ ref('period_consommation_land') }}
    WHERE
        period_consommation_land.land_id = land.land_id AND
        period_consommation_land.land_type = land.land_type AND
        from_year = 2011 AND
        to_year = 2020
) conso_2011_2020 ON true
LEFT JOIN LATERAL (
    SELECT
        total as conso_since_2021,
        total / (to_year + 1 - from_year) as annual_conso_since_2021,
        total / (to_year + 1 - from_year) * 9 as projected_conso_2030
    FROM {{ ref('period_consommation_land') }}
    WHERE
        period_consommation_land.land_id = land.land_id AND
        period_consommation_land.land_type = land.land_type AND
        from_year = 2021
    ORDER BY to_year DESC
    LIMIT 1
) conso_since_2021 ON true
ORDER BY projected_percent_use_by_2030 DESC
