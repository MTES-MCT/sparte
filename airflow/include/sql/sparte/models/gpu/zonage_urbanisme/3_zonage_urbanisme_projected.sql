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

/*
La jointure avec la table commune sert uniquement à déterminer le SRID de projection
(chaque département a son propre système de coordonnées projetées).
L'appartenance des zonages aux territoires (commune, EPCI, etc.) est gérée
par les tables de mapping dédiées (zonage_commune, etc.).
*/
select
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
    {{
        make_valid_multipolygon(
            "ST_transform(zonage.geom, commune.srid_source)"
        )
    }} as geom,
    commune.departement as departement,
    commune.srid_source as srid_source
FROM
    {{ ref("2_zonage_urbanisme_normalized") }} as zonage
LEFT JOIN LATERAL (
    SELECT
        departement,
        srid_source
    FROM
        {{ ref("commune") }} as commune
    WHERE
        st_intersects(commune.geom_4326, zonage.geom)
    LIMIT 1
) commune ON true
