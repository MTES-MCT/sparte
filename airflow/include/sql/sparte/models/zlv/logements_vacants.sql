{{ config(materialized='table') }}


with communes as (
    SELECT
        "CODGEO_25"::text as land_id,
        "LIBGEO_25" as land_name,
        '{{ var('COMMUNE') }}' as land_type,
        "CODGEO_25"::text as code_insee,
        "pp_total_20", "pp_total_21", "pp_total_22", "pp_total_23", "pp_total_24",
        "pp_vacant_20", "pp_vacant_21", "pp_vacant_22", "pp_vacant_23", "pp_vacant_24",
        "pp_vacant_plus_2ans_20", "pp_vacant_plus_2ans_21", "pp_vacant_plus_2ans_22", "pp_vacant_plus_2ans_23", "pp_vacant_plus_2ans_24"
    FROM {{ source('public', 'zlv_commune_opendata') }}
),

departements as (
    SELECT
        trim(" DEP "::text) as land_id,
        " LIB_DEP " as land_name,
        '{{ var('DEPARTEMENT') }}' as land_type,
        trim(" DEP "::text) as code_insee,
        " pp_total_20 " as "pp_total_20", " pp_total_21 " as "pp_total_21", " pp_total_22 " as "pp_total_22", " pp_total_23 " as "pp_total_23", " pp_total_24 " as "pp_total_24",
        " pp_vacant_20 " as "pp_vacant_20", " pp_vacant_21 " as "pp_vacant_21", " pp_vacant_22 " as "pp_vacant_22", " pp_vacant_23 " as "pp_vacant_23", " pp_vacant_24 " as "pp_vacant_24",
        " pp_vacant_plus_2ans_20 " as "pp_vacant_plus_2ans_20", " pp_vacant_plus_2ans_21 " as "pp_vacant_plus_2ans_21", " pp_vacant_plus_2ans_22 " as "pp_vacant_plus_2ans_22", " pp_vacant_plus_2ans_23 " as "pp_vacant_plus_2ans_23", " pp_vacant_plus_2ans_24 " as "pp_vacant_plus_2ans_24"
    FROM {{ source('public', 'zlv_departement_opendata') }}
),

regions as (
    SELECT
        lpad(trim(" REG "::text), 2, '0') as land_id,
        " LIB_REG " as land_name,
        '{{ var('REGION') }}' as land_type,
        lpad(trim(" REG "::text), 2, '0') as code_insee,
        " pp_total_20 " as "pp_total_20", " pp_total_21 " as "pp_total_21", " pp_total_22 " as "pp_total_22", " pp_total_23 " as "pp_total_23", " pp_total_24 " as "pp_total_24",
        " pp_vacant_20 " as "pp_vacant_20", " pp_vacant_21 " as "pp_vacant_21", " pp_vacant_22 " as "pp_vacant_22", " pp_vacant_23 " as "pp_vacant_23", " pp_vacant_24 " as "pp_vacant_24",
        " pp_vacant_longue_duree_20 " as "pp_vacant_plus_2ans_20", " pp_vacant_plus_2ans_21 " as "pp_vacant_plus_2ans_21", " pp_vacant_plus_2ans_22 " as "pp_vacant_plus_2ans_22", " pp_vacant_plus_2ans_23 " as "pp_vacant_plus_2ans_23", " pp_vacant_plus_2ans_24 " as "pp_vacant_plus_2ans_24"
    FROM {{ source('public', 'zlv_region_opendata') }}
),

all_data as (
    SELECT * FROM communes
    UNION ALL
    SELECT * FROM departements
    UNION ALL
    SELECT * FROM regions
),

unpivoted as (
    SELECT land_id, land_name, land_type, code_insee, 2020 as year,
        NULLIF(NULLIF(replace("pp_total_20", ' ', ''), ''), 's')::int as logements_parc_prive,
        NULLIF(NULLIF(replace("pp_vacant_20", ' ', ''), ''), 's')::int as logements_vacants_parc_prive,
        NULLIF(NULLIF(replace("pp_vacant_plus_2ans_20", ' ', ''), ''), 's')::int as logements_vacants_2ans_parc_prive,
        (replace("pp_total_20", ' ', '') = 's' OR replace("pp_vacant_20", ' ', '') = 's' OR replace("pp_vacant_plus_2ans_20", ' ', '') = 's') as is_secretise
    FROM all_data
    UNION ALL
    SELECT land_id, land_name, land_type, code_insee, 2021 as year,
        NULLIF(NULLIF(replace("pp_total_21", ' ', ''), ''), 's')::int as logements_parc_prive,
        NULLIF(NULLIF(replace("pp_vacant_21", ' ', ''), ''), 's')::int as logements_vacants_parc_prive,
        NULLIF(NULLIF(replace("pp_vacant_plus_2ans_21", ' ', ''), ''), 's')::int as logements_vacants_2ans_parc_prive,
        (replace("pp_total_21", ' ', '') = 's' OR replace("pp_vacant_21", ' ', '') = 's' OR replace("pp_vacant_plus_2ans_21", ' ', '') = 's') as is_secretise
    FROM all_data
    UNION ALL
    SELECT land_id, land_name, land_type, code_insee, 2022 as year,
        NULLIF(NULLIF(replace("pp_total_22", ' ', ''), ''), 's')::int as logements_parc_prive,
        NULLIF(NULLIF(replace("pp_vacant_22", ' ', ''), ''), 's')::int as logements_vacants_parc_prive,
        NULLIF(NULLIF(replace("pp_vacant_plus_2ans_22", ' ', ''), ''), 's')::int as logements_vacants_2ans_parc_prive,
        (replace("pp_total_22", ' ', '') = 's' OR replace("pp_vacant_22", ' ', '') = 's' OR replace("pp_vacant_plus_2ans_22", ' ', '') = 's') as is_secretise
    FROM all_data
    UNION ALL
    SELECT land_id, land_name, land_type, code_insee, 2023 as year,
        NULLIF(NULLIF(replace("pp_total_23", ' ', ''), ''), 's')::int as logements_parc_prive,
        NULLIF(NULLIF(replace("pp_vacant_23", ' ', ''), ''), 's')::int as logements_vacants_parc_prive,
        NULLIF(NULLIF(replace("pp_vacant_plus_2ans_23", ' ', ''), ''), 's')::int as logements_vacants_2ans_parc_prive,
        (replace("pp_total_23", ' ', '') = 's' OR replace("pp_vacant_23", ' ', '') = 's' OR replace("pp_vacant_plus_2ans_23", ' ', '') = 's') as is_secretise
    FROM all_data
    UNION ALL
    SELECT land_id, land_name, land_type, code_insee, 2024 as year,
        NULLIF(NULLIF(replace("pp_total_24", ' ', ''), ''), 's')::int as logements_parc_prive,
        NULLIF(NULLIF(replace("pp_vacant_24", ' ', ''), ''), 's')::int as logements_vacants_parc_prive,
        NULLIF(NULLIF(replace("pp_vacant_plus_2ans_24", ' ', ''), ''), 's')::int as logements_vacants_2ans_parc_prive,
        (replace("pp_total_24", ' ', '') = 's' OR replace("pp_vacant_24", ' ', '') = 's' OR replace("pp_vacant_plus_2ans_24", ' ', '') = 's') as is_secretise
    FROM all_data
    -- 2025 retiré : le parc privé total (pp_total) n'est pas renseigné pour cette année,
    -- bien que le parc vacant (pp_vacant_25, pp_vacant_plus_2ans_25) le soit.
)

SELECT
    land_id,
    land_type,
    land_name,
    year,
    logements_parc_prive,
    logements_vacants_parc_prive,
    logements_vacants_2ans_parc_prive,
    code_insee,
    is_secretise
FROM unpivoted
