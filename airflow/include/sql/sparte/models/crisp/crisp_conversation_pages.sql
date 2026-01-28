{{
    config(
        materialized='table',
    )
}}

SELECT
    session_id,
    page_title,
    page_url,
    page_referrer,
    timestamp
FROM {{ source('public', 'crisp_conversation_pages') }}
