{{
    config(
        materialized='table',
        tags=['final'],
    ) }}

SELECT *, ST_Area(geom) FROM (
    SELECT
        ocsge.departement,
        ocsge.commune_code,
        ST_Union(geom) AS geom
    FROM
        {{ ref("occupation_du_sol_commune") }} AS ocsge
    WHERE
        ocsge.is_artificial = true
    GROUP BY
        ocsge.commune_code,
        ocsge.departement
) as foo
