{{ config(materialized='table') }}

with marked_duplicates as (
    select
        id,
        email,
        created_date,
        confirmation_date,
        row_number() over (partition by email order by created_date) as row_num
    from {{ source('public', 'app_newsletter') }}
)
SELECT
    id,
    email,
    created_date,
    confirmation_date
FROM
    marked_duplicates
WHERE
    row_num = 1
