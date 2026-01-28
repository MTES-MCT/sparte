{{
    config(
        materialized='table',
    )
}}

SELECT
    total,
    segments,
    fetched_at
FROM {{ source('public', 'crisp_people_stats') }}
