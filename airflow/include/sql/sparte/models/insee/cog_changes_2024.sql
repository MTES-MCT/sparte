{{ config(materialized='table') }}

SELECT
    index,
    "MOD"                             AS type_de_changement,
    "TYPECOM_AV"                      AS type_commune_avant,
    "COM_AV"                          AS code_commune_avant,
    "TNCC_AV"                         AS type_de_nom_en_clair_avant,
    "NCC_AV"                          AS nom_en_clair_avant,
    "LIBELLE_AV"                      AS libelle_avant,
    "TYPECOM_AP"                      AS type_commune_apres,
    "COM_AP"                          AS code_commune_apres,
    "TNCC_AP"                         AS type_de_nom_en_clair_apres,
    "NCC_AP"                          AS nom_en_clair_apres,
    "NCCENR_AP"                       AS nom_en_clair_enrichi_apres,
    "LIBELLE_AP"                      AS libelle_apres,
    TO_DATE("DATE_EFF", 'YYYY-MM-DD') AS date_effet
FROM
    {{ source('public', 'insee_cog_changes_2024') }}
