{{
    config(
        materialized='incremental',
        post_hook="{{ delete_from_this_where_field_not_in('ocsge_loaded_date', 'occupation_du_sol', 'loaded_date') }}"
    )
}}

/*

Cette requête retourne une géométrie par commune et par année regroupant
toutes les surfaces artificielles du territoire.

*/

with artificial_commune_without_surface as (
    SELECT
        concat(ocsge.commune_code::text, '_', ocsge.year::text) as commune_year_id, -- surrogate key

        ocsge.commune_code,
        ocsge.ocsge_loaded_date,
        ocsge.srid_source,

        ocsge.departement,
        ocsge.year,
        ST_Union(geom) as geom
    FROM
        {{ ref("occupation_du_sol_commune") }} AS ocsge
    WHERE
        ocsge.is_artificial = true

    {% if is_incremental() %}
        AND ocsge.ocsge_loaded_date >
            (SELECT max(foo.ocsge_loaded_date) FROM {{ this }} as foo)
    {% endif %}

    GROUP BY
        ocsge.commune_code,
        ocsge.departement,
        ocsge.year,
        ocsge.ocsge_loaded_date,
        ocsge.srid_source
)
SELECT
    *,
    ST_Area(geom) as surface
FROM
    artificial_commune_without_surface
