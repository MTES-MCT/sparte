{{
    config(
        materialized='incremental',
        post_hook="{{ delete_from_this_where_field_not_in('ocsge_loaded_date', 'difference', 'loaded_date') }}"
    )
}}

/*

Cette requête découpe les objets OCS GE de différence par commune.

Dans le cas où un objet OCS GE est découpé par plusieurs communes, il sera dupliqué, mais
la surface totale de l'objet sera conservée.

*/


with difference_commune_without_surface as (
    SELECT
        concat(ocsge.uuid::text, '_', commune.code::text) as ocsge_commune_id, -- surrogate key
        -- les attributs spécifiques aux communes sont préfixés par commune_
        commune.code as commune_code,
        -- les attributs spécifiques aux objets OCS GE sont préfixés par ocsge_
        ocsge.loaded_date as ocsge_loaded_date,
        ocsge.uuid as ocsge_uuid,
        -- les attributs communs aux deux tables sont sans préfixe
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
        ocsge.srid_source,
        ST_Intersection(commune.geom, ocsge.geom) AS geom
    FROM
        {{ ref("commune") }} AS commune
    INNER JOIN
        {{ ref("difference") }} AS ocsge
    ON
        ocsge.departement = commune.departement
    AND
        ocsge.srid_source = commune.srid_source
    AND
        ST_Intersects(commune.geom, ocsge.geom)

    {% if is_incremental() %}
        WHERE ocsge.uuid not in (SELECT bar.ocsge_uuid from {{ this }} as bar)
    {% endif %}
)

SELECT
    *,
    ST_Area(geom) as surface
FROM
    difference_commune_without_surface
