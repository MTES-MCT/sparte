{{ config(materialized="table") }}

SELECt
    idlink_va,
    idsite,
    idvisitor_user_id.idvisitor,
    idvisitor_user_id.user_id, -- DO NOT USE. Use custom_dimension_1 instead.
    idvisit,
    idaction_url_ref,
    idaction_name_ref,
    custom_float,
    pageview_position,
    server_time,
    idpageview,
    idaction_name,
    idaction_url,
    action.visited_page as visited_page,
    action.project_id as project_id,
    search_count,
    time_spent_ref_action,
    idaction_product_cat,
    idaction_product_cat2,
    idaction_product_cat3,
    idaction_product_cat4,
    idaction_product_cat5,
    idaction_product_name,
    product_price,
    idaction_product_sku,
    idaction_event_action,
    idaction_event_category,
    idaction_content_interaction,
    idaction_content_name,
    idaction_content_piece,
    idaction_content_target,
    time_dom_completion,
    time_dom_processing,
    time_network,
    time_on_load,
    time_server,
    time_transfer,
    time_spent,
    custom_dimension_1,
    custom_dimension_2,
    custom_dimension_3,
    custom_dimension_4,
    custom_dimension_5
 FROM {{ source('public', 'matomo_log_link_visit_action') }} as link_visit_action
 LEFt JOIN {{ ref('matomo_log_action') }} AS action
    ON link_visit_action.idaction_url = action.idaction
LEFT JOIN
    {{ ref('idvisitor_user_id') }} AS idvisitor_user_id
    ON link_visit_action.idvisitor = idvisitor_user_id.idvisitor
