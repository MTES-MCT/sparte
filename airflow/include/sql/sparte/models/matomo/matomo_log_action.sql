{{ config(materialized="table") }}

SELECt
    idaction,
    name,
    hash,
    type,
    url_prefix,
    {{ extract_project_id_from_url('name') }} as project_id,
    {{ extract_visited_page_from_url('name') }} as visited_page
 FROM
    {{ source('public', 'matomo_log_action') }}
ORDER BY idaction DESC
