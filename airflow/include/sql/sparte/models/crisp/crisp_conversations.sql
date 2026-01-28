{{
    config(
        materialized='table',
    )
}}

SELECT
    session_id,
    inbox_id,
    created_at,
    updated_at,
    is_verified,
    is_blocked,
    availability,
    state,
    status,
    active
FROM {{ source('public', 'crisp_conversations') }}
