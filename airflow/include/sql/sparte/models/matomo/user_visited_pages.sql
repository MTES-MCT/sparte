
{{
    config(
        materialized="table",
        indexes=[],
    )
}}


SELECT
    distinct visited_page, user_id
FROM {{ ref('matomo_log_link_visit_action')}}
WHERE
    visited_page IS NOT NULL AND
    user_id IS NOT NULL
