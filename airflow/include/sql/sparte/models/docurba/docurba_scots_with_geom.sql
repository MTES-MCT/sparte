{{
    config(
        materialized="table",
        indexes=[
            {"columns": ["scot_codecollectivite"], "type": "btree"},
            {"columns": ["scot_code_region"], "type": "btree"},
            {"columns": ["scot_code_departement"], "type": "btree"},
            {"columns": ["pa_id"], "type": "btree"},
            {"columns": ["pc_id"], "type": "btree"},
            {"columns": ["geom"], "type": "gist"},
        ],
    )
}}

WITH perimetre_communes AS (
    SELECT
        perimetre.procedure_id,
        perimetre.opposable,
        ST_Union(commune.geom) as geom
    FROM
        {{ ref('docurba_scots_perimetre') }} perimetre
    LEFT JOIN
        {{ ref('commune') }} commune
    ON
        perimetre.collectivite_code = commune.code
    GROUP BY
        perimetre.procedure_id,
        perimetre.opposable
)

SELECT
    scots.annee_cog,
    scots.scot_code_region,
    scots.scot_libelle_region,
    scots.scot_code_departement,
    scots.scot_lib_departement,
    scots.scot_codecollectivite,
    scots.scot_code_type_collectivite,
    scots.scot_nom_collectivite,
    scots.pa_id,
    scots.pa_nom_schema,
    scots.pa_noserie_procedure,
    scots.pa_scot_interdepartement,
    scots.pa_date_publication_perimetre,
    scots.pa_date_prescription,
    scots.pa_date_arret_projet,
    scots.pa_date_approbation,
    scots.pa_annee_approbation,
    scots.pa_date_fin_echeance,
    scots.pa_nombre_communes,
    scots.pc_id,
    scots.pc_nom_schema,
    scots.pc_noserie_procedure,
    scots.pc_proc_elaboration_revision,
    scots.pc_scot_interdepartement,
    scots.pc_date_publication_perimetre,
    scots.pc_date_prescription,
    scots.pc_date_arret_projet,
    scots.pc_nombre_communes,
    COALESCE(perimetre_opposable.geom, perimetre_en_cours.geom) as geom
FROM
    {{ ref('docurba_scots') }} scots
LEFT JOIN
    perimetre_communes perimetre_opposable
ON
    scots.pa_id = perimetre_opposable.procedure_id
    AND perimetre_opposable.opposable = true
LEFT JOIN
    perimetre_communes perimetre_en_cours
ON
    scots.pc_id = perimetre_en_cours.procedure_id
    AND perimetre_en_cours.opposable = false
