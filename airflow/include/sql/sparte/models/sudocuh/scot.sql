{{ config(materialized='table') }}

SELECT
    index,
    annee_cog,
    scotpopulationmillesime     AS scot_population_millesime,
    circonscription_reg2016     AS circonscription_region_2016_code,
    circonscription_region2016  AS circonscription_region_2016_nom,
    circonscription_dept        AS circonscription_departement_code,
    circonscription_departement AS circonscription_departement_nom,
    scot.id_scot::text,
    nom_scot,
    derniere_procedure,
    scot_moderne,
    code_etat_code              AS code_etat,
    code_etat_libelle,
    code_etat_elaboration_revision,
    epci_porteur_siren::text,
    epci_porteur_type,
    epci_porteur_type_libelle,
    epci_porteur_nom,
    scot_approuve_nom_schema,
    scot_approuve_noserie_procedure,
    scot_approuve_scot_interdepartement,
    scot_approuve_date_publication_perimetre,
    scot_approuve_date_prescription,
    scot_approuve_date_arret_projet,
    scot_approuve_date_approbation,
    scot_approuve_annee_approbation,
    scot_approuve_date_approbation_precedent,
    scot_approuve_date_fin_echeance,
    scot_approuve_scot_loi_ene,
    scot_approuve_moe,
    scot_approuve_cout_ht,
    scot_approuve_cout_ttc,
    perimetre_approuve_nombre_communes,
    perimetre_approuve_pop_municipale,
    perimetre_approuve_pop_totale,
    perimetre_approuve_superficie,
    perimetre_approuve_zb_nombre_communes,
    perimetre_approuve_zb_pop_totale,
    perimetre_approuve_zb_superficie,
    scot_en_cours_pcnomschema,
    scot_en_cours_pcnoserieprocedure,
    scot_en_cours_pcscotinterdepartement,
    scot_en_cours_pcdatepublicationperimetre,
    scot_en_cours_pcdateprescription,
    scot_en_cours_pcdatearretprojet,
    scot_en_cours_pclibellemoe,
    scot_en_cours_pccoutschemaht,
    scot_en_cours_pccoutschemattc,
    perimetre_en_cours_pcnombrecommunes,
    perimetre_en_cours_pcpopmunicipale,
    perimetre_en_cours_pcpopulationtotale,
    perimetre_en_cours_pcsuperficie,
    scot_geom.geom as geom,
    scot_geom.srid_source as srid_source
FROM {{ source('public', 'sudocuh_scot') }} as scot
LEFT JOIN {{ ref('scot_geom') }} as scot_geom
ON scot_geom.id_scot::text = scot.id_scot::text
