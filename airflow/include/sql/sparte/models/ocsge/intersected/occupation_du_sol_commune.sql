{{
    config(
        materialized='table',
        indexes=[
            {'columns': ['departement'], 'type': 'btree'},
            {'columns': ['year'], 'type': 'btree'},
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

with occupation_du_sol_commune_without_surface as (
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
        ocsge.srid_source,
        ST_Intersection(commune.geom, ocsge.geom) AS geom
    FROM
        {{ ref("commune") }} AS commune
    INNER JOIN
        {{ ref("occupation_du_sol") }} AS ocsge
    ON
        ocsge.departement = commune.departement
    AND
        ocsge.srid_source = commune.srid_source
    AND
        ST_Intersects(commune.geom, ocsge.geom)
)

SELECT
    *,
    ST_Area(geom) as surface
FROM
    occupation_du_sol_commune_without_surface
