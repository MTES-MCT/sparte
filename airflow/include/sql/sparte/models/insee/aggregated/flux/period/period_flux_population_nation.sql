{{ config(materialized='table') }}

SELECT
    '{{ var("NATION") }}' as nation,
    from_year,
    to_year,
    sum(evolution) as evolution,
    (
        sum(evolution) * 100 / (
            CASE
                WHEN sum(start_population) = 0 THEN 1
                ELSE sum(start_population)
            END
        )
    ) as evolution_percent,
    PERCENTILE_CONT(0.5) WITHIN GROUP(ORDER BY evolution) as evolution_median,
    PERCENTILE_CONT(0.5) WITHIN GROUP(ORDER BY evolution_percent) as evolution_median_percent,
    avg(evolution) as evolution_avg,
    sum(start_population) as start_population
FROM
    {{ ref('period_flux_population_region') }}
GROUP BY
    from_year,
    to_year
