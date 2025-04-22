{{
    config(
        materialized="table",
        indexes=[{"columns": ["ocsge_loaded_date"], "type": "btree"}],
    )
}}

/*

Cette requête retourne une géométrie par commune et par année regroupant
toutes les surfaces artificielles du territoire.

*/
with
    artificial_commune_without_surface as (
        select
            concat(ocsge.commune_code::text, '_', ocsge.year::text) as commune_year_id,  -- surrogate key

            ocsge.commune_code,
            ocsge.ocsge_loaded_date,
            ocsge.srid_source,
            ocsge.departement,
            ocsge.year,
            st_union(geom) as geom
        from {{ ref("occupation_du_sol_commune") }} as ocsge
        where ocsge.is_artificial = true

        group by
            ocsge.commune_code,
            ocsge.departement,
            ocsge.year,
            ocsge.ocsge_loaded_date,
            ocsge.srid_source
    )
select *, st_area(geom) as surface
from artificial_commune_without_surface
