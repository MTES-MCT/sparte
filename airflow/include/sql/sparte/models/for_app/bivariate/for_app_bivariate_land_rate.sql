{{
    config(materialized='table')
}}

{#
    Rythmes annuels pré-calculés pour les cartes bivariées.
    Chaque ligne = un territoire × une période × un indicateur.

    Logique period_years (identique au backend Python) :
      - end_year <= 2016 → champs _11 → _16
      - start_year >= 2016 → champs _16 → _22
      - sinon → champs _11 → _22

    Indicateurs :
      - population  (conso_field=total)
      - logement    (conso_field=habitat)
      - menages     (conso_field=habitat)
      - emploi      (conso_field=activite)
      - residences_secondaires (conso_field=habitat, taux et non évolution)
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

-- Population : évolution %
indic_population AS (
    SELECT
        'population' AS indicator,
        'total' AS conso_field,
        ca.land_id, ca.land_type, ca.start_year, ca.end_year,
        CASE WHEN ca.surface > 0 AND (ca.end_year - ca.start_year) > 0
             THEN ROUND((ca.conso_total / ca.surface * 100 / (ca.end_year - ca.start_year))::numeric, 6)
             ELSE 0 END AS conso_rate,
        CASE WHEN (ca.end_year - ca.start_year) > 0
             THEN ROUND((ca.conso_total / 10000.0 / (ca.end_year - ca.start_year))::numeric, 2)
             ELSE 0 END AS conso_ha,
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
        'habitat' AS conso_field,
        ca.land_id, ca.land_type, ca.start_year, ca.end_year,
        CASE WHEN ca.surface > 0 AND (ca.end_year - ca.start_year) > 0
             THEN ROUND((ca.conso_habitat / ca.surface * 100 / (ca.end_year - ca.start_year))::numeric, 6)
             ELSE 0 END AS conso_rate,
        CASE WHEN (ca.end_year - ca.start_year) > 0
             THEN ROUND((ca.conso_habitat / 10000.0 / (ca.end_year - ca.start_year))::numeric, 2)
             ELSE 0 END AS conso_ha,
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
        'habitat' AS conso_field,
        ca.land_id, ca.land_type, ca.start_year, ca.end_year,
        CASE WHEN ca.surface > 0 AND (ca.end_year - ca.start_year) > 0
             THEN ROUND((ca.conso_habitat / ca.surface * 100 / (ca.end_year - ca.start_year))::numeric, 6)
             ELSE 0 END AS conso_rate,
        CASE WHEN (ca.end_year - ca.start_year) > 0
             THEN ROUND((ca.conso_habitat / 10000.0 / (ca.end_year - ca.start_year))::numeric, 2)
             ELSE 0 END AS conso_ha,
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
        'activite' AS conso_field,
        ca.land_id, ca.land_type, ca.start_year, ca.end_year,
        CASE WHEN ca.surface > 0 AND (ca.end_year - ca.start_year) > 0
             THEN ROUND((ca.conso_activite / ca.surface * 100 / (ca.end_year - ca.start_year))::numeric, 6)
             ELSE 0 END AS conso_rate,
        CASE WHEN (ca.end_year - ca.start_year) > 0
             THEN ROUND((ca.conso_activite / 10000.0 / (ca.end_year - ca.start_year))::numeric, 2)
             ELSE 0 END AS conso_ha,
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
        'habitat' AS conso_field,
        ca.land_id, ca.land_type, ca.start_year, ca.end_year,
        CASE WHEN ca.surface > 0 AND (ca.end_year - ca.start_year) > 0
             THEN ROUND((ca.conso_habitat / ca.surface * 100 / (ca.end_year - ca.start_year))::numeric, 6)
             ELSE 0 END AS conso_rate,
        CASE WHEN (ca.end_year - ca.start_year) > 0
             THEN ROUND((ca.conso_habitat / 10000.0 / (ca.end_year - ca.start_year))::numeric, 2)
             ELSE 0 END AS conso_ha,
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
)

SELECT * FROM indic_population
UNION ALL
SELECT * FROM indic_logement
UNION ALL
SELECT * FROM indic_menages
UNION ALL
SELECT * FROM indic_emploi
UNION ALL
SELECT * FROM indic_res_secondaires
