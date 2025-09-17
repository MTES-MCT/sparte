{{ config(
    materialized="table",
    indexes=[
        {"columns": ["user_id"], "type": "btree"},
        {"columns": ["idvisitor"], "type": "btree"},
        {"columns": ["idvisitor_hex"], "type": "btree"},
    ],
) }}

select *
from
    (
        select distinct
            coalesce(custom_dimension_1, user_id) as user_id,
            case
                when custom_dimension_1 is not null then 'from_custom_dimension_1'
                when user_id is not null then 'from_user_id'
                else 'unknown'
            end as source_user_id_field,
            idvisitor,
            encode(idvisitor, 'hex') as idvisitor_hex
        from {{ ref('matomo_log_visit') }}
    )
where user_id is not null
