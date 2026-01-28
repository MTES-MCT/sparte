{{
    config(
        materialized='table',
    )
}}

SELECT
    session_id,
    fingerprint,
    type,
    origin,
    content,
    read,
    delivered,
    timestamp,
    user_id,
    from_type
FROM {{ source('public', 'crisp_conversation_messages') }}
