{{
    config(
        materialized='table',
    )
}}

SELECT
    people_id,
    email,
    nickname,
    avatar,
    gender,
    phone,
    address,
    city,
    country,
    company_name,
    company_url,
    segments,
    created_at,
    updated_at
FROM {{ source('public', 'crisp_people') }}
