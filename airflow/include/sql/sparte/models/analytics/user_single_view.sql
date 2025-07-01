{{
    config(
        materialized='table',
    )
}}


SELECT
    user_table.id as id,
    user_table.last_login as user_last_login_date,
    user_table.is_superuser as user_is_superuser,
    user_table.first_name as user_firstname,
    user_table.last_name as user_lastname,
    user_table.email as user_email,
    user_table.is_staff as user_is_staff,
    /* is_active, -> champs supprimé car non défini */
    user_table.date_joined as user_created_date,
    user_table.email_checked as user_email_verified,
    user_table.function as user_function,
    user_table.organism as user_organism,
    user_table.main_land_id as user_main_land_id,
    user_table.main_land_type as user_main_land_type,
    user_table.service as user_service,
    user_table.siret as user_siret,
    user_table.proconnect as user_proconnect,
    request.request_count as user_download_diagnostic_count,
    request.latest_request as user_last_download_diagnostic_date,
    project.project_count as user_online_diagnostic_count,
    project.latest_project as user_last_online_diagnostic_date,
    coalesce(project.target_2031_modified, false) as user_target_2031_modified,
    land.name as main_land_name,
    land.has_ocsge as main_land_has_ocsge,
    land.has_zonage as main_land_has_zonage,
    land.has_friche as main_land_has_friche,
    land.surface_artif as main_land_surface_artif,
    land.percent_artif as main_land_percent_artif,
    land.years_artif as main_land_years_artif,
    land.ocsge_status as main_land_ocsge_status,
    newsletter.created_date as newsletter_opt_in_date,
    newsletter.confirmation_date as newsletter_double_opt_in_date,
    newsletter.created_date is not null and newsletter.confirmation_date is not null as newsletter_fully_opted_in,
    matomo_log_visit.*,
    visited_pages.*,
    satisfaction_form.*
FROM
    {{ ref('user') }} as user_table
LEFT JOIN LATERAL (
    SELECT count(*) as request_count, max(created_date) as latest_request FROM (
        SELECT * FROM {{ ref('request')}}
        WHERE user_table.id = request.user_id
    )
) AS request ON true
LEFT JOIN LATERAL (
    SELECT
        count(*) as project_count,
        max(created_date) as latest_project,
        bool_or(target_2031_modified) as target_2031_modified
    FROM (
        SELECT * FROM {{ ref('project')}}
        WHERE user_table.id = project.user_id
    )
) AS project ON true
LEFT JOIN LATERAL (
    SELECT * FROM
        {{ ref('land_details') }} as land_details
    WHERE
        user_table.main_land_id = land_details.land_id
        AND user_table.main_land_type = land_details.land_type
    LiMIT 1
) AS land ON true
LEFt JOIN LATERAL (
    SELECT
        newsletter.created_date,
        newsletter.confirmation_date
    FROM
        {{ ref('newsletter')}} as newsletter
    WHERE
        user_table.email = newsletter.email
    LIMIT 1
) AS newsletter ON true
LEFT JOIN LATERAL (
    SELECT
        visitor_returning,
        visitor_seconds_since_first,
        visitor_seconds_since_order,
        visitor_count_visits,
        visitor_localtime,
        visitor_seconds_since_last,
        config_resolution,
        config_cookie,
        config_flash,
        config_java,
        config_pdf,
        config_quicktime,
        config_realplayer,
        config_silverlight,
        config_windowsmedia,
        visit_total_time,
        location_city,
        location_country,
        location_latitude,
        location_longitude,
        location_region,
        custom_dimension_1,
        custom_dimension_2,
        custom_dimension_3,
        custom_dimension_4,
        custom_dimension_5
    FROM {{ ref('matomo_log_visit') }} as matomo_log_visit
    WHERE user_table.email = matomo_log_visit.user_id
    ORDER BY visitor_count_visits DESC
    LIMIT 1
) AS matomo_log_visit ON true
LEFT JOIN LATERAL (
    SELECT
        array_agg(visited_page) as pages
    FROM {{ ref('user_visited_pages') }} as user_visited_pages
    WHERE user_table.email = user_visited_pages.user_id
) AS raw_visited_pages ON true
LEFT JOIN LATERAL (
    SELECT
        coalesce('artificialisation' = any(raw_visited_pages.pages), false) as visited_page_artificialisation,
        coalesce('friches' = any(raw_visited_pages.pages), false) as visited_page_friches,
        coalesce('consommation' = any(raw_visited_pages.pages), false) as visited_page_consommation,
        coalesce('rapport-local	' = any(raw_visited_pages.pages), false) as visited_page_rapport_local,
        coalesce('telechargements' = any(raw_visited_pages.pages), false) as visited_page_telechargements,
        coalesce('trajectoires' = any(raw_visited_pages.pages), false) as visited_page_trajectoires,
        coalesce('vacance-des-logements	' = any(raw_visited_pages.pages), false) as visited_page_vacance_des_logements
) AS visited_pages ON true
LEFT JOIN LATERAL (
    SELECT
        nps,
        suggested_change
    FROM {{ ref('satisfaction_form_entry')}}
    where user_table.id = satisfaction_form_entry.user_id
    ORDER BY recorded_date DESC
    LIMIT 1
) AS satisfaction_form ON true
