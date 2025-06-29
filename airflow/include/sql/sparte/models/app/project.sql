{{ config(materialized='table') }}


SELECT
    id,
    name,
    analyse_start_date,
    analyse_end_date,
    user_id,
    is_public,
    look_a_like,
    created_date,
    updated_date,
    level,
    land_id,
    land_type,
    cover_image,
    folder_name,
    territory_name,
    target_2031
FROM {{ source('public', 'app_project') }}
