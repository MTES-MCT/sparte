{{ config(materialized="table", docs={"node_color": "purple"}) }}

select *
from
    (
        select
            uuid,
            code_cs as couverture,
            code_us as usage,
            year,
            id as id_source,
            is_artificial,
            surface,
            srid_source,
            departement,
            is_impermeable,
            st_transform(geom, 4326) as mpoly
        from {{ ref("occupation_du_sol_with_artif") }}
    ) as ocsge
where
    st_isvalid(ocsge.mpoly)

    /*
Le st_transform génére parfois des géométries invalides
d'où la nécessité de filtrer les géométries invalides
*/
