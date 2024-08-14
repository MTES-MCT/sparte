{{
    config(
        materialized='incremental',
        post_hook='DELETE FROM {{ this }} WHERE uuid not in (SELECT uuid FROM {{ ref("difference") }} )'

    )
}}

SELECT *, ST_Area(geom) as surface FROM (
    SELECT
        commune.code as commune_code,
        ocsge.loaded_date,
        ocsge.year_old,
        ocsge.year_new,
        ocsge.departement,
        ocsge.new_is_impermeable,
        ocsge.new_is_artificial,
        ocsge.new_not_impermeable,
        ocsge.new_not_artificial,
        ocsge.cs_old,
        ocsge.us_old,
        ocsge.cs_new,
        ocsge.us_new,
        ocsge.uuid,
        ST_Intersection(commune.geom, ocsge.geom) AS geom
    FROM
        {{ ref("commune") }} AS commune
    INNER JOIN
        {{ ref("difference") }} AS ocsge
    ON
        ocsge.departement = commune.departement
    AND
        ST_Intersects(commune.geom, ocsge.geom)

    {% if is_incremental() %}
        WHERE ocsge.uuid not in (SELECT bar.uuid from {{ this }} as bar)
    {% endif %}
) as foo
