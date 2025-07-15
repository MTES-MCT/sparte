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
    commune.code as commune_code,
    commune.departement as departement,
    commune.srid_source as srid_source
FROM
    {{ ref("2_zonage_urbanisme_normalized") }} as zonage
LEFT JOIN LATERAL (
    SELECT
        code,
        departement,
        srid_source
    FROM
        {{ ref("commune") }} as commune
    WHERE
        commune.geom_4326 && zonage.geom
        AND st_contains(
            commune.geom_4326, st_pointonsurface(zonage.geom)
        )
) commune ON true
