{{ config(materialized='table') }}

SELECT *
FROM {{ ref('consommation_guadeloupe') }}
UNION ALL
SELECT *
FROM {{ ref('consommation_martinique') }}
UNION ALL
SELECT *
FROM {{ ref('consommation_guyane') }}
UNION ALL
SELECT *
FROM {{ ref('consommation_reunion') }}
UNION ALL
SELECT *
FROM {{ ref('consommation_metropole') }}
