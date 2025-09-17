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
            coalesce(custom_dimension_1, user_id) as user_id,
            case
                when custom_dimension_1 is not null
                then 'from_custom_dimension_1'
                when user_id is not null
                then 'from_user_id'
                else 'unknown'
            end as source_user_id_field
        from {{ ref('matomo_log_link_visit_action') }}
        where visited_page is not null
    )
where user_id is not null
