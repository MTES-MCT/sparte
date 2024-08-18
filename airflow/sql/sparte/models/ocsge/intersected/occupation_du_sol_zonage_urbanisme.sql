{{
    config(
        materialized='incremental',
        indexes=[
            {'columns': ['departement'], 'type': 'btree'},
            {'columns': ['year'], 'type': 'btree'},
            {'columns': ['uuid'], 'type': 'btree'},
            {'columns': ['zonage_checksum'], 'type': 'btree'}
        ],
        post_hook=[
            'DELETE FROM {{ this }} WHERE uuid not in (SELECT uuid FROM {{ ref("occupation_du_sol") }} )',
            'DELETE FROM {{ this }} WHERE zonage_checksum not in (SELECT checksum FROM {{ ref("zonage_urbanisme") }} )'
        ]
    )
}}

SELECT *, ST_Area(geom) as surface FROM (
    SELECT
        zonage.libelle AS zonage_libelle,
        zonage.checksum AS zonage_checksum,
        zonage.gpu_timestamp AS zonage_gpu_timestamp,
        ocsge.loaded_date AS ocsge_loaded_date,
        ocsge.year,
        ocsge.departement,
        ocsge.code_cs,
        ocsge.code_us,
        ocsge.uuid,
        ocsge.is_artificial,
        ocsge.is_impermeable,
        ST_Intersection(zonage.geom, ocsge.geom) AS geom
    FROM
        {{ ref("zonage_urbanisme") }} AS zonage
    INNER JOIN
        {{ ref("occupation_du_sol") }} AS ocsge
    ON
        ST_Intersects(zonage.geom, ocsge.geom)

    {% if is_incremental() %}
        WHERE ocsge.loaded_date >
            (SELECT max(foo.ocsge_loaded_date) FROM {{ this }} as foo)
        OR
        zonage.gpu_timestamp >
            (SELECT max(bar.zonage_gpu_timestamp) FROM {{ this }} as bar)
    {% endif %}

) as foo
