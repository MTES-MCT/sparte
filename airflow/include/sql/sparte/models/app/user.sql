{{ config(materialized='table') }}


SELECT
    id,
    last_login,
    is_superuser,
    first_name,
    last_name,
    email,
    is_staff,
    is_active,
    date_joined,
    email_checked,
    function,
    organism,
    created_at,
    updated_at,
    main_land_id,
    main_land_type,
    service,
    siret,
    proconnect
FROM {{ source('public', 'app_user')}}
