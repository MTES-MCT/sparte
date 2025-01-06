{{ config(materialized='table') }}

SELECT
    "ANNEE"::int as year,
    "COMM" as code_commune,
    "TYPE_LGT" as type_logement,
    coalesce(replace("LOG_AUT", '.0', '')::int, 0) as logements_autorises,
    coalesce(replace("LOG_COM", '.0', '')::int, 0) as logements_commences,
    coalesce("SDP_AUT"::float, 0.0) as surface_de_plancher_autorisee,
    coalesce("SDP_COM"::float, 0.0) as surface_de_plancher_commencee
FROM
    {{ source('public', 'sitadel_donnees_annuelles_communales_logements') }}
ORDER BY
    code_commune,
    year
