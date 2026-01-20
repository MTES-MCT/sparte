{{ config(materialized='table') }}

SELECT
    /* collectivité */
    annee_cog::int as annee_cog,
    scot_code_region,
    scot_libelle_region,
    scot_code_departement,
    scot_lib_departement,
    scot_codecollectivite,
    scot_code_type_collectivite,
    scot_nom_collectivite,
    /* SCoT opposable */
    pa_id,
    pa_nom_schema,
    pa_noserie_procedure,
    pa_scot_interdepartement,
    pa_date_publication_perimetre::date as pa_date_publication_perimetre,
    pa_date_prescription::date as pa_date_prescription,
    pa_date_arret_projet::date as pa_date_arret_projet,
    pa_date_approbation::date as pa_date_approbation,
    pa_annee_approbation::int as pa_annee_approbation,
    pa_date_fin_echeance::date as pa_date_fin_echeance,
    pa_nombre_communes::int as pa_nombre_communes,
    /* SCoT en cours */
    pc_id,
    pc_nom_schema,
    pc_noserie_procedure,
    pc_proc_elaboration_revision,
    pc_scot_interdepartement,
    pc_date_publication_perimetre::date as pc_date_publication_perimetre,
    pc_date_prescription::date as pc_date_prescription,
    pc_date_arret_projet::date as pc_date_arret_projet,
    pc_nombre_communes::int as pc_nombre_communes
FROM
    {{ source('public', 'docurba_scots') }}
