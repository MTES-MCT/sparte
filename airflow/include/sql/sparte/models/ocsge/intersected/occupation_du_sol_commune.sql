{{
    config(
        materialized='incremental',
        post_hook="{{ delete_from_this_where_field_not_in('ocsge_loaded_date', 'occupation_du_sol', 'loaded_date') }}",
        indexes=[
            {'columns': ['departement'], 'type': 'btree'},
            {'columns': ['year'], 'type': 'btree'},
            {'columns': ['uuid'], 'type': 'btree'},
            {'columns': ['commune_code'], 'type': 'btree'},
            {'columns': ['ocsge_uuid'], 'type': 'btree'},
            {'columns': ['geom'], 'type': 'gist'},
            {'columns': ['ocsge_loaded_date'], 'type': 'btree'}
        ]
    )
}}

/*

Cette requête découpe les objets OCS GE d'occupation du sol par commune.

Dans le cas où un objet OCS GE est découpé par plusieurs communes, il sera dupliqué, mais
la surface totale de l'objet sera conservée.

*/

with max_ocsge_loaded_date as (
    SELECT max(ocsge_loaded_date) as ocsge_loaded_date FROM {{ this }}
), occupation_du_sol_commune_without_surface as (
    SELECT
        concat(ocsge.uuid::text, '_', commune.code::text) as ocsge_commune_id, -- surrogate key
        -- les attributs spécifiques aux communes sont préfixés par commune_
        commune.code AS commune_code,
        -- les attributs spécifiques aux objets OCS GE sont préfixés par ocsge_
        ocsge.uuid as ocsge_uuid,
        ocsge.loaded_date as ocsge_loaded_date,
        -- les attributs communs aux deux tables sont sans préfixe
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
        WHERE ocsge.loaded_date > (select ocsge_loaded_date from max_ocsge_loaded_date)
    {% endif %}
)

SELECT
    *,
    ST_Area(geom) as surface
FROM
    occupation_du_sol_commune_without_surface
