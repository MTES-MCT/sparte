{{
    config(
        materialized='table',
        docs={'node_color': 'purple'}
    )
}}


SELECT
    user_email as "EMAIL",
    user_lastname as "NOM",
    user_firstname as "PRENOM",
    user_created_date as "DATE_CREATION_COMPTE",
    user_function as "FONCTION",
    user_organism as "ORGANISME",
    user_last_online_diagnostic_date as "LAST_DATE_DIAG_CREATED",
    main_land_name as "NOM_TERRITOIRE",
    user_online_diagnostic_count as "NB_DIAG_CREES",
    user_download_diagnostic_count as "NB_DIAG_TELECHARGES",
    nps as "NPS",
    {{ boolean_as_oui_non('newsletter_fully_opted_in', true) }} as "EST_INSCRIT_NEWSLETTER",
    newsletter_opt_in_date as "DATE_INSCRIPTION_NEWSLETTER",
    newsletter_double_opt_in_date as "DATE_CONFIRMATION_INSCRIPTION_NEWSLETTER",
    {{ boolean_as_oui_non('main_land_competence_planification', true) }} as "A_COMPETENCE_URBA",
    id as "EXT_ID",
    {{ boolean_as_oui_non('visited_page_trajectoires', true) }} as "ARRIVE_BAS_PAGE_TRAJ",
    {{ boolean_as_oui_non('visited_page_vacance_des_logements', true) }} as "ARRIVE_BAS_PAGE_VACANCE",
    {{ boolean_as_oui_non('user_target_2031_modified', true) }} as "A_MODIFIE_OBJ_REDUC_CONSO",
    {{ boolean_as_oui_non('visited_page_consommation', true) }} as "ARRIVE_BAS_PAGE_CONSO",
    {{ boolean_as_oui_non('visited_page_artificialisation', true) }} as "ARRIVE_BAS_PAGE_ARTIF",
    {{ boolean_as_oui_non('visited_page_friches', true) }} as "ARRIVE_BAS_DE_PAGE_FRICHES"
FROM
    {{ ref('user_single_view')}}
