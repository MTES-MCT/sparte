
{{
    config(
        materialized="table",
        indexes=[],
    )
}}


SELECT distinct visited_page
FROM {{ ref('matomo_log_action')}}
where visited_page is not null
and visited_page != 'd'
