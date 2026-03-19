{{
    config(materialized='table')
}}

{#
    Terciles nationaux de l'axe consommation.
    Calculés sur l'ensemble des territoires France entière pour chaque
    (land_type, conso_field, start_year, end_year).

    Le range [min, max] de chaque tercile est explicite.
#}

{% set min_year = 2009 %}
{% set max_year = 2023 %}
{% set land_types = [var("COMMUNE"), var("EPCI"), var("SCOT"), var("DEPARTEMENT"), var("REGION")] %}

WITH periods AS (
    SELECT s.start_year, e.end_year
    FROM generate_series({{ min_year }}, {{ max_year - 1 }}) AS s(start_year)
    CROSS JOIN generate_series({{ min_year + 1 }}, {{ max_year }}) AS e(end_year)
    WHERE e.end_year > s.start_year
),

conso_agg AS (
    SELECT
        c.land_id,
        c.land_type,
        p.start_year,
        p.end_year,
        SUM(c.total) AS conso_total,
        SUM(c.habitat) AS conso_habitat,
        SUM(c.activite) AS conso_activite,
        MAX(c.surface) AS surface
    FROM {{ ref('for_app_landconso') }} c
    CROSS JOIN periods p
    WHERE c.land_id IS NOT NULL
      AND c.year >= p.start_year
      AND c.year < p.end_year
      AND c.land_type IN ('{{ land_types | join("', '") }}')
    GROUP BY c.land_id, c.land_type, p.start_year, p.end_year
),

conso_rates AS (
    SELECT land_type, 'total' AS conso_field, start_year, end_year,
        CASE WHEN surface > 0 AND (end_year - start_year) > 0
             THEN ROUND((conso_total / surface * 100 / (end_year - start_year))::numeric, 6)
             ELSE 0 END AS conso_rate
    FROM conso_agg
    UNION ALL
    SELECT land_type, 'habitat' AS conso_field, start_year, end_year,
        CASE WHEN surface > 0 AND (end_year - start_year) > 0
             THEN ROUND((conso_habitat / surface * 100 / (end_year - start_year))::numeric, 6)
             ELSE 0 END AS conso_rate
    FROM conso_agg
    UNION ALL
    SELECT land_type, 'activite' AS conso_field, start_year, end_year,
        CASE WHEN surface > 0 AND (end_year - start_year) > 0
             THEN ROUND((conso_activite / surface * 100 / (end_year - start_year))::numeric, 6)
             ELSE 0 END AS conso_rate
    FROM conso_agg
),

ranked AS (
    SELECT
        land_type,
        conso_field,
        start_year,
        end_year,
        conso_rate,
        NTILE(3) OVER (
            PARTITION BY land_type, conso_field, start_year, end_year
            ORDER BY conso_rate
        ) AS tercile
    FROM conso_rates
    WHERE conso_rate IS NOT NULL
)

SELECT
    land_type,
    conso_field,
    start_year,
    end_year,
    MIN(CASE WHEN tercile = 1 THEN conso_rate END) AS t1_min,
    MAX(CASE WHEN tercile = 1 THEN conso_rate END) AS t1_max,
    MIN(CASE WHEN tercile = 2 THEN conso_rate END) AS t2_min,
    MAX(CASE WHEN tercile = 2 THEN conso_rate END) AS t2_max,
    MIN(CASE WHEN tercile = 3 THEN conso_rate END) AS t3_min,
    MAX(CASE WHEN tercile = 3 THEN conso_rate END) AS t3_max
FROM ranked
GROUP BY land_type, conso_field, start_year, end_year
