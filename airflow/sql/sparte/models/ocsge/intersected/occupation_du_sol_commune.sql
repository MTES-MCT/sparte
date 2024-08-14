{{
    config(
        materialized='incremental',
        post_hook='DELETE FROM {{ this }} WHERE uuid not in (SELECT uuid FROM {{ ref("occupation_du_sol") }} )'
    )
}}

SELECT *, ST_Area(geom) as surface FROM (
    SELECT
        commune.code AS commune_code,
        ocsge.uuid,
        ocsge.loaded_date,
        ocsge.year,
        ocsge.departement,
        ocsge.code_cs,
        ocsge.code_us,
        ocsge.is_artificial,
        ocsge.is_impermeable,
        ST_Intersection(commune.geom, ocsge.geom) AS geom
    FROM
        {{ ref("commune") }} AS commune
    INNER JOIN
        {{ ref("occupation_du_sol") }} AS ocsge
    ON
        ocsge.departement = commune.departement
    AND
        ST_Intersects(commune.geom, ocsge.geom)

    {% if is_incremental() %}
        WHERE ocsge.uuid not in (SELECT foo.uuid from {{ this }} as foo)
    {% endif %}

) as foo
