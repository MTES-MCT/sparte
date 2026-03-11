{{
    config(materialized='table')
}}

{#
    Terciles nationaux de l'axe indicateur.
    Calculés sur l'ensemble des territoires France entière pour chaque
    (indicator, land_type, start_year, end_year).

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
        p.end_year
    FROM {{ ref('for_app_landconso') }} c
    CROSS JOIN periods p
    WHERE c.land_id IS NOT NULL
      AND c.year >= p.start_year
      AND c.year < p.end_year
      AND c.land_type IN ('{{ land_types | join("', '") }}')
    GROUP BY c.land_id, c.land_type, p.start_year, p.end_year
),

-- Population : évolution %
indic_population AS (
    SELECT
        'population' AS indicator,
        ca.land_type, ca.start_year, ca.end_year,
        CASE
            WHEN ca.end_year <= 2016 AND ind.population_11 > 0
                THEN ROUND(((ind.population_16 - ind.population_11)::numeric / ind.population_11 * 100 / 5), 4)
            WHEN ca.start_year >= 2016 AND ind.population_16 > 0
                THEN ROUND(((ind.population_22 - ind.population_16)::numeric / ind.population_16 * 100 / 6), 4)
            WHEN ind.population_11 > 0
                THEN ROUND(((ind.population_22 - ind.population_11)::numeric / ind.population_11 * 100 / 11), 4)
            ELSE NULL
        END AS indic_rate
    FROM conso_agg ca
    LEFT JOIN {{ ref('for_app_dc_population') }} ind
        ON ind.land_id = ca.land_id AND ind.land_type = ca.land_type
),

-- Logement : évolution %
indic_logement AS (
    SELECT
        'logement' AS indicator,
        ca.land_type, ca.start_year, ca.end_year,
        CASE
            WHEN ca.end_year <= 2016 AND ind.logements_11 > 0
                THEN ROUND(((ind.logements_16 - ind.logements_11)::numeric / ind.logements_11 * 100 / 5), 4)
            WHEN ca.start_year >= 2016 AND ind.logements_16 > 0
                THEN ROUND(((ind.logements_22 - ind.logements_16)::numeric / ind.logements_16 * 100 / 6), 4)
            WHEN ind.logements_11 > 0
                THEN ROUND(((ind.logements_22 - ind.logements_11)::numeric / ind.logements_11 * 100 / 11), 4)
            ELSE NULL
        END AS indic_rate
    FROM conso_agg ca
    LEFT JOIN {{ ref('for_app_dc_logement') }} ind
        ON ind.land_id = ca.land_id AND ind.land_type = ca.land_type
),

-- Ménages : évolution %
indic_menages AS (
    SELECT
        'menages' AS indicator,
        ca.land_type, ca.start_year, ca.end_year,
        CASE
            WHEN ca.end_year <= 2016 AND ind.menages_11 > 0
                THEN ROUND(((ind.menages_16 - ind.menages_11)::numeric / ind.menages_11 * 100 / 5), 4)
            WHEN ca.start_year >= 2016 AND ind.menages_16 > 0
                THEN ROUND(((ind.menages_22 - ind.menages_16)::numeric / ind.menages_16 * 100 / 6), 4)
            WHEN ind.menages_11 > 0
                THEN ROUND(((ind.menages_22 - ind.menages_11)::numeric / ind.menages_11 * 100 / 11), 4)
            ELSE NULL
        END AS indic_rate
    FROM conso_agg ca
    LEFT JOIN {{ ref('for_app_dc_menages') }} ind
        ON ind.land_id = ca.land_id AND ind.land_type = ca.land_type
),

-- Emploi : évolution %
indic_emploi AS (
    SELECT
        'emploi' AS indicator,
        ca.land_type, ca.start_year, ca.end_year,
        CASE
            WHEN ca.end_year <= 2016 AND ind.actifs_occupes_15_64_11 > 0
                THEN ROUND(((ind.actifs_occupes_15_64_16 - ind.actifs_occupes_15_64_11)::numeric / ind.actifs_occupes_15_64_11 * 100 / 5), 4)
            WHEN ca.start_year >= 2016 AND ind.actifs_occupes_15_64_16 > 0
                THEN ROUND(((ind.actifs_occupes_15_64_22 - ind.actifs_occupes_15_64_16)::numeric / ind.actifs_occupes_15_64_16 * 100 / 6), 4)
            WHEN ind.actifs_occupes_15_64_11 > 0
                THEN ROUND(((ind.actifs_occupes_15_64_22 - ind.actifs_occupes_15_64_11)::numeric / ind.actifs_occupes_15_64_11 * 100 / 11), 4)
            ELSE NULL
        END AS indic_rate
    FROM conso_agg ca
    LEFT JOIN {{ ref('for_app_dc_activite_chomage') }} ind
        ON ind.land_id = ca.land_id AND ind.land_type = ca.land_type
),

-- Résidences secondaires : taux (pas une évolution)
indic_res_secondaires AS (
    SELECT
        'residences_secondaires' AS indicator,
        ca.land_type, ca.start_year, ca.end_year,
        CASE
            WHEN ca.end_year <= 2016 AND ind.logements_16 > 0
                THEN ROUND((ind.residences_secondaires_16::numeric / ind.logements_16 * 100), 4)
            WHEN ind.logements_22 > 0
                THEN ROUND((ind.residences_secondaires_22::numeric / ind.logements_22 * 100), 4)
            ELSE NULL
        END AS indic_rate
    FROM conso_agg ca
    LEFT JOIN {{ ref('for_app_dc_logement') }} ind
        ON ind.land_id = ca.land_id AND ind.land_type = ca.land_type
),

all_indic AS (
    SELECT * FROM indic_population
    UNION ALL
    SELECT * FROM indic_logement
    UNION ALL
    SELECT * FROM indic_menages
    UNION ALL
    SELECT * FROM indic_emploi
    UNION ALL
    SELECT * FROM indic_res_secondaires
),

ranked AS (
    SELECT
        indicator,
        land_type,
        start_year,
        end_year,
        indic_rate,
        NTILE(3) OVER (
            PARTITION BY indicator, land_type, start_year, end_year
            ORDER BY indic_rate
        ) AS tercile
    FROM all_indic
    WHERE indic_rate IS NOT NULL
)

SELECT
    indicator,
    land_type,
    start_year,
    end_year,
    MIN(CASE WHEN tercile = 1 THEN indic_rate END) AS t1_min,
    MAX(CASE WHEN tercile = 1 THEN indic_rate END) AS t1_max,
    MIN(CASE WHEN tercile = 2 THEN indic_rate END) AS t2_min,
    MAX(CASE WHEN tercile = 2 THEN indic_rate END) AS t2_max,
    MIN(CASE WHEN tercile = 3 THEN indic_rate END) AS t3_min,
    MAX(CASE WHEN tercile = 3 THEN indic_rate END) AS t3_max
FROM ranked
GROUP BY indicator, land_type, start_year, end_year
