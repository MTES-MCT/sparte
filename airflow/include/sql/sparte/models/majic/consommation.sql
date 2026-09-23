{{ config(materialized='table') }}

SELECT *
FROM {{ ref('consommation_guadeloupe_2025') }}
UNION ALL
SELECT *
FROM {{ ref('consommation_martinique_2025') }}
UNION ALL
SELECT *
FROM {{ ref('consommation_guyane_2025') }}
UNION ALL
SELECT *
FROM {{ ref('consommation_reunion_2025') }}
UNION ALL
SELECT *
FROM {{ ref('consommation_metropole_2025') }}
