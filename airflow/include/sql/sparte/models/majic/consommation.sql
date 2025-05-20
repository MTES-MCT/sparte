{{ config(materialized='table') }}

SELECT *
FROM {{ ref('consommation_guadeloupe_2024') }}
UNION ALL
SELECT *
FROM {{ ref('consommation_martinique_2024') }}
UNION ALL
SELECT *
FROM {{ ref('consommation_guyane_2024') }}
UNION ALL
SELECT *
FROM {{ ref('consommation_reunion_2024') }}
UNION ALL
SELECT *
FROM {{ ref('consommation_metropole_2024') }}
