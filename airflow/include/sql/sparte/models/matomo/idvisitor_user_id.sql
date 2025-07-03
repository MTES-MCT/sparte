
{{ config(
    materialized="table",
    indexes=[
        {"columns": ["user_id"], "type": "btree"},
        {"columns": ["idvisitor"], "type": "btree"},
        {"columns": ["idvisitor_hex"], "type": "btree"},
    ],
) }}

SELECt DISTINCT
    user_id,
    idvisitor,
    encode(idvisitor, 'hex') as idvisitor_hex
FROM
    {{ ref('matomo_log_visit')}}
where user_id is not null
