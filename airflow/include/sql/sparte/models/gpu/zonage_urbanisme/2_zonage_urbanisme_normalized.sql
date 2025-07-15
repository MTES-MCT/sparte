{{
    config(
        materialized="table",
        indexes=[
            {"columns": ["geom"], "type": "gist"},
            {"columns": ["libelle"], "type": "btree"},
            {"columns": ["type_zone"], "type": "btree"},
            {"columns": ["geom"], "type": "gist"},
        ],
    )
}}

select
    gpu_doc_id,
    gpu_status,
    gpu_timestamp::timestamptz as gpu_timestamp,
    partition,
    libelle,
    nullif(libelong, '') as libelle_long,
    {{ standardize_zonage_type("typezone") }} as type_zone,
    nullif(destdomi, '') as destination_dominante,
    nomfic as nom_fichier,
    nullif(urlfic, '') as url_fichier,
    datappro as date_approbation,
    datvalid as date_validation,
    nullif(idurba, '') as id_document_urbanisme,
    (encode(sha256(st_astext(geom)::bytea), 'hex')) as checksum,
    {{ make_valid_multipolygon('geom') }} as geom
FROM
    {{ ref("1_zonage_urbanisme_raw") }} as zonage
