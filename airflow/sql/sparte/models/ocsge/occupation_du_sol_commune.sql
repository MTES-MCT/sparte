{{ config(materialized='table') }}

SELECT *, ST_Area(geom) as surface FROM (
    SELECT
        commune.code AS commune_code,
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
) as foo
