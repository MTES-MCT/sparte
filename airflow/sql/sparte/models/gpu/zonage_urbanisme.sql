
{{
    config(
        materialized='table',
        indexes=[
            {'columns': ['geom'], 'type': 'gist'},
            {'columns': ['libelle'], 'type': 'btree'},
            {'columns': ['type_zone'], 'type': 'btree'}
        ])
}}


SELECT
    gpu_doc_id,
    gpu_status,
    gpu_timestamp,
    partition,
    libelle,
    libelong as libelle_long,
    typezone as type_zone,
    destdomi as destination_dominante,
    nomfic as nom_fichier,
    urlfic as url_fichier,
    insee as commune_code,
    datappro as date_approbation,
    datvalid as date_validation,
    idurba as id_document_urbanisme,
    gen_random_uuid() as uuid,
    ST_MakeValid(ST_transform(geom, 2154)) as geom
 FROM
    {{ source('public', 'zone_urba') }}
