/*
    Table de statut des logements vacants par territoire.

    Cette table calcule pour chaque territoire :
    - Les données brutes de logements vacants (privé et social)
    - Les pourcentages de vacance
    - Le statut global de gisement potentiel
    - Les flags de disponibilité des données

    Règles de gestion des NULL :
    - Les valeurs individuelles (parc privé, parc social) conservent leurs NULL
    - Le parc général est calculé comme la somme des deux parcs (NULL traités comme 0)
    - Les pourcentages sont NULL si les données sources sont NULL
*/

{{
    config(
        materialized='table',
        indexes=[{"columns": ["land_id", "land_type"], "type": "btree"}],
    )
}}

/*
    CTE 1: latest_year_data
    Récupère les données de logements vacants pour l'année la plus récente uniquement.
*/
with latest_year_data as (
    SELECT
        land_id,
        land_type,
        logements_parc_prive,
        logements_vacants_parc_prive,
        logements_parc_social,
        logements_vacants_parc_social,
        logements_parc_general,
        logements_vacants_parc_general,
        logements_vacants_parc_general_percent,
        logements_vacants_parc_prive_percent,
        logements_vacants_parc_social_percent,
        logements_vacants_parc_prive_on_parc_general_percent,
        logements_vacants_parc_social_on_parc_general_percent,
        is_secretise,
        secretisation_status
    FROM
        {{ ref('logement_vacants_land')}}
    WHERE year = (
        SELECT max(year)
        FROM {{ ref('logement_vacants_land') }}
    )
),

/*
    CTE 2: with_status
    Joint les données de logements vacants avec tous les territoires et calcule :
    - Le parc général (somme privé + social)
    - Les pourcentages de vacance
    - Le statut de gisement
    - Les flags de disponibilité des données
*/
with_status as (
    SELECT
        land.land_id,
        land.land_type,

        -- ============================================
        -- DONNÉES BRUTES (conservent les NULL)
        -- ============================================
        logements_parc_prive,
        logements_vacants_parc_prive,
        logements_parc_social,
        logements_vacants_parc_social,

        -- ============================================
        -- PARC GÉNÉRAL (somme des deux parcs)
        -- NULL est traité comme 0 pour permettre le calcul même si un seul parc a des données
        -- ============================================
        coalesce(logements_parc_prive, 0) + coalesce(logements_parc_social, 0) as logements_parc_general,
        coalesce(logements_vacants_parc_prive, 0) + coalesce(logements_vacants_parc_social, 0) as logements_vacants_parc_general,

        -- ============================================
        -- POURCENTAGES DE VACANCE
        -- ============================================

        -- Pourcentage de vacance sur le parc général
        -- NULL si aucun logement dans le parc général
        case
            when coalesce(logements_parc_prive, 0) + coalesce(logements_parc_social, 0) > 0
            then (coalesce(logements_vacants_parc_prive, 0) + coalesce(logements_vacants_parc_social, 0))::float
                 / (coalesce(logements_parc_prive, 0) + coalesce(logements_parc_social, 0)) * 100
        end as logements_vacants_parc_general_percent,

        -- Pourcentages individuels (viennent de la source, conservent les NULL)
        logements_vacants_parc_prive_percent,
        logements_vacants_parc_social_percent,

        -- ============================================
        -- POURCENTAGES DE CONTRIBUTION AU PARC GÉNÉRAL
        -- Part de chaque parc dans le total des logements vacants
        -- NULL si les données sources sont NULL
        -- ============================================

        -- Contribution du parc privé au parc général
        case
            when logements_vacants_parc_prive is not null
                 and coalesce(logements_parc_prive, 0) + coalesce(logements_parc_social, 0) > 0
            then logements_vacants_parc_prive::float
                 / (coalesce(logements_parc_prive, 0) + coalesce(logements_parc_social, 0)) * 100
        end as logements_vacants_parc_prive_on_parc_general_percent,

        -- Contribution du parc social au parc général
        case
            when logements_vacants_parc_social is not null
                 and coalesce(logements_parc_prive, 0) + coalesce(logements_parc_social, 0) > 0
            then logements_vacants_parc_social::float
                 / (coalesce(logements_parc_prive, 0) + coalesce(logements_parc_social, 0)) * 100
        end as logements_vacants_parc_social_on_parc_general_percent,

        -- ============================================
        -- SECRETISATION
        -- ============================================
        coalesce(is_secretise, false) as is_secretise_prive,
        coalesce(secretisation_status, 'non_secretise') as secretisation_status_prive,

        -- ============================================
        -- STATUT DE GISEMENT
        -- Détermine le potentiel de remobilisation des logements vacants
        --
        -- Distinction importante :
        -- - valeur = 0 : données disponibles, pas de logements vacants
        -- - valeur IS NULL : données indisponibles pour ce parc
        --
        -- Ordre de priorité :
        -- 1. Secrétisation totale (aucune donnée disponible)
        -- 2. Gisement nul avec données partielles (un parc à 0, l'autre indisponible)
        -- 3. Gisement nul (aucun logement vacant, données complètes)
        -- 4. Gisement dans les deux parcs
        -- 5-6. Gisement dans un seul parc avec données de l'autre parc indisponibles
        -- 7-8. Gisement dans un seul parc avec l'autre parc à zéro
        -- ============================================
        CASE
            -- ===========================================
            -- CAS 1 : SECRÉTISATION TOTALE
            -- Aucune donnée disponible (privé totalement secrétisé ET pas de données sociales)
            -- ===========================================
            when coalesce(secretisation_status, 'non_secretise') = 'totalement_secretise'
                 and logements_vacants_parc_social IS NULL
                THEN 'Données non diffusables pour raison de secret statistique'

            -- ===========================================
            -- CAS 2 : GISEMENT NUL AVEC DONNÉES PARTIELLES
            -- Aucun logement vacant dans les données disponibles, mais données incomplètes
            -- ===========================================
            when logements_vacants_parc_social = 0
                 and logements_vacants_parc_prive IS NULL
                THEN 'Aucun logement vacant chez les bailleurs sociaux. Parc privé non couvert par les données.'
            when logements_vacants_parc_prive = 0
                 and logements_vacants_parc_social IS NULL
                THEN 'Aucun logement vacant dans le parc privé. Parc social non couvert par les données.'

            -- ===========================================
            -- CAS 3 : GISEMENT NUL
            -- Aucun logement vacant dans les données disponibles (données complètes)
            -- ===========================================
            when coalesce(logements_vacants_parc_prive, 0) + coalesce(logements_vacants_parc_social, 0) = 0
                 and coalesce(secretisation_status, 'non_secretise') = 'partiellement_secretise'
                THEN 'Aucun logement vacant identifié. Certaines données sont masquées (secret statistique).'
            when coalesce(logements_vacants_parc_prive, 0) + coalesce(logements_vacants_parc_social, 0) = 0
                THEN 'Aucun logement vacant identifié sur ce territoire'

            -- ===========================================
            -- CAS 4 : GISEMENT DANS LES DEUX PARCS
            -- Logements vacants dans le privé ET le social
            -- ===========================================
            when coalesce(logements_vacants_parc_social, 0) > 0
                 and coalesce(logements_vacants_parc_prive, 0) > 0
                 and coalesce(secretisation_status, 'non_secretise') = 'partiellement_secretise'
                THEN 'Logements vacants dans le parc privé et chez les bailleurs sociaux. Données partiellement masquées.'
            when coalesce(logements_vacants_parc_social, 0) > 0
                 and coalesce(logements_vacants_parc_prive, 0) > 0
                THEN 'Logements vacants dans le parc privé et chez les bailleurs sociaux'

            -- ===========================================
            -- CAS 5 : GISEMENT SOCIAL AVEC DONNÉES PRIVÉES INDISPONIBLES
            -- Logements vacants dans le social, données privées NULL
            -- ===========================================
            when coalesce(logements_vacants_parc_social, 0) > 0
                 and logements_vacants_parc_prive IS NULL
                THEN 'Logements vacants chez les bailleurs sociaux. Parc privé non couvert par les données.'

            -- ===========================================
            -- CAS 6 : GISEMENT PRIVÉ AVEC DONNÉES SOCIALES INDISPONIBLES
            -- Logements vacants dans le privé, données sociales NULL
            -- ===========================================
            when coalesce(logements_vacants_parc_prive, 0) > 0
                 and logements_vacants_parc_social IS NULL
                THEN 'Logements vacants dans le parc privé. Parc social non couvert par les données.'

            -- ===========================================
            -- CAS 7 : GISEMENT UNIQUEMENT DANS LE SOCIAL
            -- Logements vacants dans le social, privé à zéro
            -- ===========================================
            when coalesce(logements_vacants_parc_social, 0) > 0
                 and logements_vacants_parc_prive = 0
                 and coalesce(secretisation_status, 'non_secretise') = 'partiellement_secretise'
                THEN 'Logements vacants uniquement chez les bailleurs sociaux. Données du parc privé partiellement masquées.'
            when coalesce(logements_vacants_parc_social, 0) > 0
                 and logements_vacants_parc_prive = 0
                THEN 'Logements vacants uniquement chez les bailleurs sociaux. Aucun dans le parc privé.'

            -- ===========================================
            -- CAS 8 : GISEMENT UNIQUEMENT DANS LE PRIVÉ
            -- Logements vacants dans le privé, social à zéro
            -- ===========================================
            when coalesce(logements_vacants_parc_prive, 0) > 0
                 and logements_vacants_parc_social = 0
                 and coalesce(secretisation_status, 'non_secretise') = 'partiellement_secretise'
                THEN 'Logements vacants uniquement dans le parc privé. Données partiellement masquées (secret statistique).'
            when coalesce(logements_vacants_parc_prive, 0) > 0
                 and logements_vacants_parc_social = 0
                THEN 'Logements vacants uniquement dans le parc privé. Aucun chez les bailleurs sociaux.'
        END as status,

        -- ============================================
        -- FLAGS DE DISPONIBILITÉ DES DONNÉES
        -- Indiquent si les données sont disponibles pour chaque parc
        -- Utilisés par l'application pour conditionner l'affichage
        -- ============================================
        latest_year_data.logements_vacants_parc_prive IS NOT NULL
            AND latest_year_data.logements_parc_prive IS NOT NULL as has_logements_vacants_prive,
        latest_year_data.logements_vacants_parc_social IS NOT NULL
            AND latest_year_data.logements_parc_social IS NOT NULL as has_logements_vacants_social

    FROM {{ ref('land') }}
    LEFT JOIN latest_year_data
        ON latest_year_data.land_id = land.land_id
        AND latest_year_data.land_type = land.land_type
)

SELECT *
FROM with_status
