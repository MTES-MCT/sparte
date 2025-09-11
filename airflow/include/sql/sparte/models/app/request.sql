{{ config(materialized='table') }}


SELECT
    id,
    first_name,
    last_name,
    email,
    created_date,
    updated_date,
    sent_date,
    done,
    project_id,
    user_id,
    sent_file,
    requested_document,
    competence_urba,
    du_en_cours
FROM {{ source('public', 'app_request')}}
