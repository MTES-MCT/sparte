{{
    config(
        materialized='table',
    )
}}

SELECT
    session_id,
    text,
    data,
    color,
    timestamp
FROM {{ source('public', 'crisp_conversation_events') }}
