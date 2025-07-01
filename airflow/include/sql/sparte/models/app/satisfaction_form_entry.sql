{{
    config(
        materialized='table',
        indexes=[
            {"columns": ["user_id"], "type": "btree"},
        ],
    )
}}


SELECt
    nps,
    suggested_change,
    user_id,
    recorded_date
FROM
    {{ source('public', 'app_satisfactionformentry') }}
