{{
    config(
        materialized="table",
        indexes=[
            {"columns": ["geom"], "type": "gist"},
        ],
    )
}}
with marked_duplicates as (
    select
        *,
        row_number() over (
            partition by geom
            order by gpu_timestamp desc
        ) as row_num
    from
        {{ ref("3_zonage_urbanisme_projected") }}
)
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
    geom,
    commune_code,
    departement,
    srid_source
FROM
    marked_duplicates
where
    row_num = 1
    and geom is not null
    and not st_isempty(geom)
