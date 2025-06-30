{{ config(materialized="table") }}

SELECt
    idaction,
    name,
    hash,
    type,
    url_prefix
 FROM
    {{ source('public', 'matomo_log_action') }}
