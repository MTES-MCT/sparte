{{ config(materialized='table') }}


with raw_data as (
    SELECT * FROM {{ source('public', 'zlv_parcs_2019') }}
    UNION ALL
    SELECT * FROM {{ source('public', 'zlv_parcs_2020') }}
    UNION ALL
    SELECT * FROM {{ source('public', 'zlv_parcs_2021') }}
    UNION ALL
    SELECT * FROM {{ source('public', 'zlv_parcs_2022') }}
    UNION ALL
    SELECT * FROM {{ source('public', 'zlv_parcs_2023') }}
    UNION ALL
    SELECT * FROM {{ source('public', 'zlv_parcs_2024') }}
)
SELECT
    replace(siren, ' ', '')     as code_siren,
    nom_etablissement           as land_name,
    type                        as land_type,
    replace(millesime, ' ', '') as year,
    replace("logements_parc-general", ' ', '')::int as logements_parc_general,
    replace("logements_parc-prive", ' ', '')::int as logements_parc_prive,
    replace("logements-vacants_parc-general", ' ', '')::int as logements_vacants_parc_general,
    replace("logements-vacants_parc-prive", ' ', '')::int as logements_vacants_parc_prive,
    replace("logements-vacants>2ans_parc-prive", ' ', '')::int as logements_vacants_2ans_parc_prive,
    replace(
        replace("code-insee", '[', '{')
        , ']', '}')::text[] as code_insee
FROM raw_data
