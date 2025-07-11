{{
    config(
        materialized="table",
        indexes=[
            {"columns": ["geom"], "type": "gist"},
            {"columns": ["libelle"], "type": "btree"},
            {"columns": ["type_zone"], "type": "btree"},
            {"columns": ["checksum"], "type": "btree"},
            {"columns": ["departement"], "type": "btree"},
            {"columns": ["srid_source"], "type": "btree"},
        ],
    )
}}

SELECT
    gpu_doc_id,
    gpu_status,
    gpu_timestamp,
    partition,
    libelle,
    libelle_long,
    type_zone,
    destination_dominante,
    nom_fichier,
    url_fichier,
    date_approbation,
    date_validation,
    id_document_urbanisme,
    checksum,
    geom,
    commune_code,
    departement,
    srid_source,
    surface
FROM
    {{ ref("5_zonage_urbanisme_with_surface") }}
