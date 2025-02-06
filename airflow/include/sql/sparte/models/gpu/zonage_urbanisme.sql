
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

SELECT *, round(ST_Area(geom)::numeric, 4) as surface FROM (
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
        row_number() OVER (PARTITION BY checksum ORDER BY gpu_timestamp),
        {{ make_valid_multipolygon('ST_transform(geom, 2154)') }} as geom,
        2154 as srid_source
    FROM
        {{ source('public', 'gpu_zone_urba') }}
    WHERE
        {{ raw_date_starts_with_yyyy('datappro') }} AND
        {{ raw_date_starts_with_yyyy('datvalid') }} AND
        NOT ST_IsEmpty(geom)
) as foo
WHERE row_number = 1
AND NOT ST_IsEmpty(geom)
