{{
    config(
        materialized='table',
        indexes=[
            {'columns': ['land_id', 'land_type'], 'type': 'btree'},
        ]
    )
}}

SELECT
    land_details.land_id,
    land_details.land_type,
    land_details.name,

    -- Nombre de diagnostics par territoire
    diagnostics.diagnostic_count,

    -- Nombre de diagnostics par année (JSON)
    diagnostics.diagnostic_count_by_year,

    -- Compétence planification
    land_details.competence_planification,

    -- Nombre de fois mis en territoire d'intérêt
    coalesce(main_land.main_land_count, 0) as main_land_count,

    -- Flags de disponibilité des données
    land_details.has_ocsge,
    land_details.has_zonage,
    land_details.has_friche,
    land_details.has_conso,
    land_details.ocsge_status,
    land_details.has_logements_vacants_prive,
    land_details.has_logements_vacants_social,
    land_details.logements_vacants_status,
    land_details.surface_artif,
    land_details.percent_artif,
    land_details.years_artif,
    land_details.surface_imper,
    land_details.percent_imper,
    land_details.years_imper,
    land_details.is_interdepartemental,
    land_details.consommation_correction_status

FROM
    {{ ref('land_details') }}

LEFT JOIN LATERAL (
    SELECT
        coalesce(sum(cnt), 0) as diagnostic_count,
        json_object_agg(year, cnt) as diagnostic_count_by_year
    FROM (
        SELECT
            extract(year from project.created_date)::int as year,
            count(*) as cnt
        FROM {{ ref('project') }}
        WHERE
            project.land_id = land_details.land_id
            AND project.land_type = land_details.land_type
        GROUP BY extract(year from project.created_date)
    ) by_year
) diagnostics ON true

LEFT JOIN LATERAL (
    SELECT count(*) as main_land_count
    FROM {{ ref('user') }} as u
    WHERE
        u.main_land_id = land_details.land_id
        AND u.main_land_type = land_details.land_type
) main_land ON true
