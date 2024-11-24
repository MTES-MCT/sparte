{{
    config(
        materialized='table',
        docs={'node_color': 'purple'}
    )
}}

SELECT
    checksum,
    libelle,
    libelle_long as libelong,
    id_document_urbanisme as idurba,
    type_zone as typezone,
    partition,
    date_approbation::text as datappro,
    date_validation::text as datvalid,
    surface / 10000 as area,
    {{ make_valid_multipolygon('ST_Transform(geom, 4326)') }} as mpoly,
    srid_source
FROM
    {{ ref('zonage_urbanisme') }}
