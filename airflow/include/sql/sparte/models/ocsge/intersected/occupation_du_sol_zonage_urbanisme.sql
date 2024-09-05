{{
    config(
        materialized='incremental',
        indexes=[
            {'columns': ['departement'], 'type': 'btree'},
            {'columns': ['year'], 'type': 'btree'},
            {'columns': ['uuid'], 'type': 'btree'},
            {'columns': ['zonage_checksum'], 'type': 'btree'},
            {'columns': ['ocsge_loaded_date'], 'type': 'btree'},
            {'columns': ['zonage_gpu_timestamp'], 'type': 'btree'},
            {'columns': ['geom'], 'type': 'gist'}
        ],
        post_hook=[
            "{{ delete_from_this_where_field_not_in('ocsge_loaded_date', 'occupation_du_sol', 'loaded_date') }}",
            "{{ delete_from_this_where_field_not_in('zonage_checksum', 'zonage_urbanisme', 'checksum') }}",
        ]
    )
}}

/*

Cette requête découpe les objets OCS GE d'occupation du sol par zonage d'urbanisme.

Dans le cas où un objet OCS GE est découpé par plusieurs zonages, il sera dupliqué, mais
la surface totale de l'objet sera conservée.

*/


with max_ocsge_loaded_date as (
    SELECT max(ocsge_loaded_date) as ocsge_loaded_date FROM {{ this }}
), max_zonage_gpu_timestamp as (
    SELECT max(zonage_gpu_timestamp) as zonage_gpu_timestamp FROM {{ this }}
), occupation_du_sol_zonage_urbanisme_without_surface as (
    SELECT
        concat(ocsge.uuid::text, '_', zonage.checksum::text) as ocsge_zonage_id, -- surrogate key
        -- les attributs spécifiques aux zonages sont préfixés par zonage_
        zonage.libelle AS zonage_libelle,
        zonage.checksum AS zonage_checksum,
        zonage.gpu_timestamp AS zonage_gpu_timestamp,
        -- les attributs spécifiques aux objets OCS GE sont préfixés par ocsge_
        ocsge.loaded_date AS ocsge_loaded_date,
        -- les attributs communs aux deux tables sont sans préfixe
        ocsge.year,
        ocsge.departement,
        ocsge.code_cs,
        ocsge.code_us,
        ocsge.uuid,
        ocsge.is_artificial,
        ocsge.is_impermeable,
        ocsge.srid_source,
        ST_Intersection(zonage.geom, ocsge.geom) AS geom
    FROM
        {{ ref("zonage_urbanisme") }} AS zonage
    INNER JOIN
        {{ ref("occupation_du_sol") }} AS ocsge
    ON
        ST_Intersects(zonage.geom, ocsge.geom)
    AND
        zonage.srid_source = ocsge.srid_source

    {% if is_incremental() %}
        where ocsge.loaded_date > (select ocsge_loaded_date from max_ocsge_loaded_date)
        or zonage.gpu_timestamp > (select zonage_gpu_timestamp from max_zonage_gpu_timestamp)
    {% endif %}
)

SELECT
    *,
    ST_Area(geom) as surface
FROM
    occupation_du_sol_zonage_urbanisme_without_surface
