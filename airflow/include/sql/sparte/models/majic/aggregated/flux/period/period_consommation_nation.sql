{{ config(materialized='table') }}

SELECT
    '{{ var("NATION") }}' as nation,
    from_year,
    to_year,
    sum(region_surface) as nation_surface,
    sum(total) as total,
    (
        sum(total) * 100 / (
            CASE
                WHEN sum(region_surface) = 0 THEN 1
                ELSE sum(region_surface)
            END
        )
    ) as total_percent,
    PERCENTILE_CONT(0.5) WITHIN GROUP(ORDER BY total) as total_median,
    PERCENTILE_CONT(0.5) WITHIN GROUP(ORDER BY total_percent) as total_median_percent,
    avg(total) as total_avg,
    sum(activite) as activite,
    (
        sum(activite) * 100 / (
            CASE
                WHEN sum(region_surface) = 0 THEN 1
                ELSE sum(region_surface)
            END
        )
    ) as activite_percent,
    PERCENTILE_CONT(0.5) WITHIN GROUP(ORDER BY activite) as activite_median,
    PERCENTILE_CONT(0.5) WITHIN GROUP(ORDER BY activite_percent) as activite_median_percent,
    avg(activite) as activite_avg,
    sum(habitat) as habitat,
    (
        sum(habitat) * 100 / (
            CASE
                WHEN sum(region_surface) = 0 THEN 1
                ELSE sum(region_surface)
            END
        )
    ) as habitat_percent,
    PERCENTILE_CONT(0.5) WITHIN GROUP(ORDER BY habitat) as habitat_median,
    PERCENTILE_CONT(0.5) WITHIN GROUP(ORDER BY habitat_percent) as habitat_median_percent,
    avg(habitat) as habitat_avg,
    sum(mixte) as mixte,
    (
        sum(mixte) * 100 / (
            CASE
                WHEN sum(region_surface) = 0 THEN 1
                ELSE sum(region_surface)
            END
        )
    ) as mixte_percent,
    PERCENTILE_CONT(0.5) WITHIN GROUP(ORDER BY mixte) as mixte_median,
    PERCENTILE_CONT(0.5) WITHIN GROUP(ORDER BY mixte_percent) as mixte_median_percent,
    avg(mixte) as mixte_avg,
    sum(route) as route,
    (
        sum(route) * 100 / (
            CASE
                WHEN sum(region_surface) = 0 THEN 1
                ELSE sum(region_surface)
            END
        )
    ) as route_percent,
    PERCENTILE_CONT(0.5) WITHIN GROUP(ORDER BY route) as route_median,
    PERCENTILE_CONT(0.5) WITHIN GROUP(ORDER BY route_percent) as route_median_percent,
    avg(route) as route_avg,
    sum(ferroviaire) as ferroviaire,
    (
        sum(ferroviaire) * 100 / (
            CASE
                WHEN sum(region_surface) = 0 THEN 1
                ELSE sum(region_surface)
            END
        )
    ) as ferroviaire_percent,
    PERCENTILE_CONT(0.5) WITHIN GROUP(ORDER BY ferroviaire) as ferroviaire_median,
    PERCENTILE_CONT(0.5) WITHIN GROUP(ORDER BY ferroviaire_percent) as ferroviaire_median_percent,
    avg(ferroviaire) as ferroviaire_avg,
    sum(inconnu) as inconnu,
    (
        sum(inconnu) * 100 / (
            CASE
                WHEN sum(region_surface) = 0 THEN 1
                ELSE sum(region_surface)
            END
        )
    ) as inconnu_percent,
    PERCENTILE_CONT(0.5) WITHIN GROUP(ORDER BY inconnu) as inconnu_median,
    PERCENTILE_CONT(0.5) WITHIN GROUP(ORDER BY inconnu_percent) as inconnu_median_percent,
    avg(inconnu) as inconnu_avg
FROM
    {{ ref('period_consommation_region') }}
GROUP BY
    from_year,
    to_year
