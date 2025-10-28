{{
    config(
        materialized='table',
        docs={'node_color': 'purple'},
    )
}}

SELECT * FROM {{ ref('similar_territories_commune') }}
UNION ALL
SELECT * FROM {{ ref('similar_territories_epci') }}
UNION ALL
SELECT * FROM {{ ref('similar_territories_departement') }}
UNION ALL
SELECT * FROM {{ ref('similar_territories_region') }}
UNION ALL
SELECT * FROM {{ ref('similar_territories_scot') }}
