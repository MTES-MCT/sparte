{{ config(materialized='table') }}


with
    without_surface as (
        select
            occupation.id,
            to_timestamp(loaded_date) as loaded_date,
            code_cs,
            code_us,
            departement,
            year,
            CASE
                WHEN artif = 'artif' THEN true
                WHEN artif = 'non artif' THEN false
                ELSE null
            END AS is_artificial,
            crit_seuil as critere_seuil,
            (
                st_dump(st_intersection(
                    departement_table.geom,
                    ST_SetSRID(
                        occupation.geom,
                        departement_table.srid_source
                    )
                )
            )
            ).geom as geom,
            departement_table.srid_source as srid_source
        from {{ source("public", "ocsge_artif") }} as occupation
        left join
            {{ ref("departement") }} as departement_table
            on departement = departement_table.code
    )
select *, st_area(geom) as surface
from without_surface
where not st_isempty(geom)
