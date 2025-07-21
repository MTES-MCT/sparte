with sums as (
SELECT
    sum(conso_2011_2020) as conso_2011_2020,
    sum(allowed_conso_2021_2030) as allowed_conso_2021_2030,
    sum(conso_since_2021) as conso_since_2021,
    sum(projected_conso_2030) as projected_conso_2030

FROM {{ ref('land_trajectoires')}}
WHERE
    land_type = '{{ var("COMMUNE") }}'
GROUP BY
    land_type
)

    SELECt
        conso_2011_2020,
        allowed_conso_2021_2030,
        conso_since_2021,
        projected_conso_2030,
        allowed_conso_2021_2030 >= conso_since_2021 AS currently_respecting_regulation,
        conso_since_2021 * 100 / allowed_conso_2021_2030 AS current_percent_use,
        allowed_conso_2021_2030 >= projected_conso_2030 AS respecting_regulation_by_2030,
        projected_conso_2030 * 100 / allowed_conso_2021_2030 AS projected_percent_use_by_2030
    FROM sums
