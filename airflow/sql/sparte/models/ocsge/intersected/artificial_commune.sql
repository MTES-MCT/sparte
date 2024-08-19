{{
    config(
        materialized='incremental',
        post_hook="DELETE FROM {{ this }} WHERE loaded_date not in (SELECT loaded_date FROM {{ ref('occupation_du_sol') }} )"
    )
}}

SELECT *, ST_Area(geom) as surface FROM (
    SELECT
        ocsge.departement,
        ocsge.year,
        ocsge.commune_code,
        ocsge.loaded_date,
        ARRAY_AGG(ocsge.uuid) AS uuids,
        ST_Union(geom) as geom
    FROM
        {{ ref("occupation_du_sol_commune") }} AS ocsge
    WHERE
        ocsge.is_artificial = true
    {% if is_incremental() %}
        AND ocsge.loaded_date >
            (SELECT max(foo.loaded_date) FROM {{ this }} as foo)
    {% endif %}
    GROUP BY
        ocsge.commune_code,
        ocsge.departement,
        ocsge.year,
        ocsge.loaded_date
) as foo
