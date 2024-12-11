{{ config(materialized='table') }}

SELECT
    "ANNEE" as year,
    "COMM" as code_commune,
    "TYPE_LGT" as type_logement,
    coalesce("LOG_AUT", 0) as logements_autorises,
    coalesce("LOG_COM", 0) as logements_commences,
    coalesce("SDP_AUT", 0) as surface_de_plancher_autorisee,
    coalesce("SDP_COM", 0) as surface_de_plancher_commencee
FROM
    {{ source('public', 'sitadel_donnees_annuelles_communales_logements') }}
