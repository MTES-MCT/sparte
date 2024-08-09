{{ config(materialized='table') }}

SELECT *, ST_Area(geom) as surface FROM (
    SELECT
        zonage.libelle AS zonage_libelle,
        ocsge.year,
        ocsge.departement,
        ocsge.code_cs,
        ocsge.code_us,
        ocsge.is_artificial,
        ocsge.is_impermeable,
        ST_Intersection(zonage.geom, ocsge.geom) AS geom
    FROM
        {{ ref("zonage_urbanisme") }} AS zonage
    INNER JOIN
        {{ ref("occupation_du_sol") }} AS ocsge
    ON
        ST_Intersects(zonage.geom, ocsge.geom)
        -- TODO: reproject zonage.gome to ocsge.geom srid
) as foo
