
{{
    config(
        materialized='table',
        indexes=[{"columns": ["land_id", "land_type"], "type": "btree"}],
    )
}}

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
), with_status as (
SELECT
    land.land_id,
    land.land_type,
    coalesce(logements_parc_prive, 0) as logements_parc_prive,
    coalesce(logements_vacants_parc_prive, 0) as logements_vacants_parc_prive,
    coalesce(logements_parc_social, 0) as logements_parc_social,
    coalesce(logements_vacants_parc_social, 0 ) as logements_vacants_parc_social,
    coalesce(logements_parc_general, 0) as logements_parc_general,
    coalesce(logements_vacants_parc_general, 0) as logements_vacants_parc_general,
    coalesce(logements_vacants_parc_general_percent, 0) as logements_vacants_parc_general_percent,
    coalesce(logements_vacants_parc_prive_percent, 0) as logements_vacants_parc_prive_percent,
    coalesce(logements_vacants_parc_social_percent, 0) as logements_vacants_parc_social_percent,
    coalesce(logements_vacants_parc_prive_on_parc_general_percent, 0) as logements_vacants_parc_prive_on_parc_general_percent,
    coalesce(logements_vacants_parc_social_on_parc_general_percent, 0) as logements_vacants_parc_social_on_parc_general_percent,
    coalesce(is_secretise, false) as is_secretise_prive,
    coalesce(secretisation_status, 'non_secretise') as secretisation_status_prive,
CASE
    when coalesce(secretisation_status, 'non_secretise') = 'totalement_secretise' THEN 'données indisponibles (secretisation)'
    when coalesce(logements_vacants_parc_general, 0) = 0 AND coalesce(secretisation_status, 'non_secretise') = 'partiellement_secretise' THEN 'gisement nul (partiellement secretise)'
    when coalesce(logements_vacants_parc_general, 0) = 0 THEN 'gisement nul'
    when coalesce(logements_vacants_parc_social, 0) > 0 AND coalesce(logements_vacants_parc_prive, 0) > 0 AND coalesce(secretisation_status, 'non_secretise') = 'partiellement_secretise' THEN 'gisement potentiel dans le social et le privé (partiellement secretise)'
    when coalesce(logements_vacants_parc_social, 0) > 0 AND coalesce(logements_vacants_parc_prive, 0) > 0 THEN 'gisement potentiel dans le social et le privé'
    when coalesce(logements_vacants_parc_social, 0) > 0 AND coalesce(logements_vacants_parc_prive, 0) = 0 AND coalesce(secretisation_status, 'non_secretise') = 'partiellement_secretise' THEN 'gisement potentiel dans le social (partiellement secretise)'
    when coalesce(logements_vacants_parc_social, 0) > 0 AND coalesce(logements_vacants_parc_prive, 0) = 0 THEN 'gisement potentiel dans le social'
    when coalesce(logements_vacants_parc_social, 0) = 0 AND coalesce(logements_vacants_parc_prive, 0) > 0 AND coalesce(secretisation_status, 'non_secretise') = 'partiellement_secretise' THEN 'gisement potentiel dans le privé (partiellement secretise)'
    when coalesce(logements_vacants_parc_social, 0) = 0 AND coalesce(logements_vacants_parc_prive, 0) > 0 THEN 'gisement potentiel dans le privé'
END as status,
    latest_year_data.logements_vacants_parc_prive IS NOT NULL AND latest_year_data.logements_parc_prive IS NOT NULL as has_logements_vacants_prive,
    latest_year_data.logements_vacants_parc_social IS NOT NULL AND latest_year_data.logements_parc_social IS NOT NULL as has_logements_vacants_social
FROM {{ ref('land') }}
LEFT JOIN
latest_year_data
ON
    latest_year_data.land_id = land.land_id AND
    latest_year_data.land_type = land.land_type
)
    SELECT
     *
    FROM with_status
