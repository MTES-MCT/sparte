
{{
    config(
        materialized='table',
        indexes=[
            {'columns': ['geom'], 'type': 'gist'},
            {'columns': ['libelle'], 'type': 'btree'},
            {'columns': ['type_zone'], 'type': 'btree'},
            {'columns': ['checksum'], 'type': 'btree'}
        ])
}}

SELECT *, ST_Area(geom) as surface FROM (
    SELECT
        gpu_doc_id,
        gpu_status,
        gpu_timestamp::timestamptz as gpu_timestamp,
        partition,
        libelle,
        NULLIF(libelong, '') as libelle_long,
        typezone as type_zone,
        NULLIF(destdomi, '') as destination_dominante,
        nomfic as nom_fichier,
        NULLIF(urlfic, '') as url_fichier,
        NULLIF(insee, '') as commune_code,
        TO_DATE(NULLIF(datappro, ''), 'YYYYMMDD') as date_approbation,
        TO_DATE(NULLIF(datvalid, ''), 'YYYYMMDD') as date_validation,
        NULLIF(idurba, '') as id_document_urbanisme,
        checksum,
        row_number() OVER (PARTITION BY geom ORDER BY gpu_timestamp),
        ST_MakeValid(st_multi(
                    st_collectionextract(
                        st_makevalid(
                            ST_transform(geom, 2154)
                        ),
                    3)
        )) as geom
    FROM
        {{ source('public', 'gpu_zone_urba') }}
) as foo
WHERE row_number = 1
