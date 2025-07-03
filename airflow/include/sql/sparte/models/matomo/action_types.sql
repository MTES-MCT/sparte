
{{
    config(
        materialized="table",
        indexes=[],
    )
}}

SELECt
    id,
    name,
    description
FROM
    {{ source('public', 'matomo_action_types') }}
