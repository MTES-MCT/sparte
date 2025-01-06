{{ config(materialized='table') }}

SELECT
    "ANNEE"::int as year,
    "DEPARTEMENT_CODE"::text as code_departement,
    "TYPE_LGT" as type_logement,
    coalesce("LOG_AUT"::int, 0) as logements_autorises,
    coalesce("LOG_COM"::int, 0) as logements_commences,
    coalesce("SDP_AUT"::float, 0.0) as surface_de_plancher_autorisee,
    coalesce("SDP_COM"::float, 0.0) as surface_de_plancher_commencee

FROM
    {{ source('public', 'sitadel_donnees_annuelles_departements_logements') }}
