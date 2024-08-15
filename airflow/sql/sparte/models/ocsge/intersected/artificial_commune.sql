{{
    config(
        materialized='incremental',
        post_hook="DELETE FROM {{ this }} WHERE NOT uuids <@ (SELECT ARRAY_AGG(uuid) FROM {{ ref('occupation_du_sol') }} )"
    )
}}

SELECT *, ST_Area(geom) as surface FROM (
    SELECT
        ocsge.departement,
        ocsge.year,
        ocsge.commune_code,
        ARRAY_AGG(ocsge.uuid) AS uuids,
        ST_Union(geom) as geom
    FROM
        {{ ref("occupation_du_sol_commune") }} AS ocsge
    WHERE
        ocsge.is_artificial = true
    GROUP BY
        ocsge.commune_code,
        ocsge.departement,
        ocsge.year,
        ocsge.loaded_date
    {% if is_incremental() %}
        HAVING NOT ARRAY_AGG(ocsge.uuid) IN (SELECT uuids FROM {{ this }})
    {% endif %}
) as foo
