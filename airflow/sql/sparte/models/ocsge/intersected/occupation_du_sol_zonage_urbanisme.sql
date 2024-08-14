{{
    config(
        materialized='incremental',
        post_hook='DELETE FROM {{ this }} WHERE uuid not in (SELECT uuid FROM {{ ref("occupation_du_sol") }} )'
    )
}}

SELECT *, ST_Area(geom) as surface FROM (
    SELECT
        zonage.libelle AS zonage_libelle,
        ocsge.loaded_date,
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
        WHERE ocsge.uuid not in (SELECT bar.uuid from {{ this }} as bar)
    {% endif %}

) as foo
