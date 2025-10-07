{{
    config(
        materialized="table",
        indexes=[],
    )
}}

select *
from
    (
        select distinct
            visited_page,
            user_id
        from {{ ref('matomo_log_link_visit_action') }}
        where visited_page is not null
    )
where user_id is not null
