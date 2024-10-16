{{ config(materialized='table') }}

SELECT
    index,
    annee_cog,
    circonscription_reg2016 AS circonscription_region_2016,
    circonscription_dept    AS circonscription_departement,
    communes_code_insee     AS commune_code,
    communes_nom            AS commune_nom,
    communes_zb             AS commune_zb,
    communes_opposable      AS commune_opposable,
    code_etat_code          AS code_etat,
    id_scot,
    nom_scot,
    epci_porteur_siren,
    scot_approuve_id_scot,
    scot_approuve_nom_schema,
    scot_approuve_noserie_procedure,
    scot_approuve_date_prescription,
    scot_approuve_date_approbation,
    scot_en_cours_id_scot,
    scot_en_cours_nom_schema,
    scot_en_cours_noserie_procedure,
    scot_en_cours_date_prescription
FROM {{ source('public', 'dgaln_scot_communes') }}
