{{
    config(
        materialized="table",
    )
}}

SELECT DISTINCT
    link_visit_action.user_id,
    action.name as outlink_url
FROM {{ ref('matomo_log_link_visit_action') }} as link_visit_action
INNER JOIN {{ ref('matomo_log_action') }} as action
    ON link_visit_action.idaction_url = action.idaction
WHERE
    action.type = 2  -- 2 = outlink
    AND link_visit_action.user_id IS NOT NULL
