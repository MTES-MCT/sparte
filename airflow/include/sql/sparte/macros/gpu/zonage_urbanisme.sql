
{% macro zonage_urbanisme(srid, extent_table) %}
{{ config(materialized='table') }}

with extent as (
    SELECT ST_transform(ST_Envelope(ST_Union(geom)), 4326) as geom FROM {{ ref(extent_table) }}
)
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
    commune_code,
    date_approbation,
    date_validation,
    id_document_urbanisme,
    checksum,
    new_geom as geom,
    srid_source,
    ST_Area(new_geom) as surface
FROM (
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
        {{ make_valid_multipolygon('ST_transform(geom, ' + srid|string + ')') }} as new_geom,
        {{ srid }} as srid_source
    FROM
        {{ source('public', 'gpu_zone_urba') }}
    WHERE
        {{ raw_date_starts_with_yyyy('datappro') }} AND
        {{ raw_date_starts_with_yyyy('datvalid') }} AND
        NOT ST_IsEmpty(geom) AND
        ST_Intersects(geom, (
            SELECT geom FROM extent
        ))
) as foo
WHERE row_number = 1
AND NOT ST_IsEmpty(new_geom)
{% endmacro %}
