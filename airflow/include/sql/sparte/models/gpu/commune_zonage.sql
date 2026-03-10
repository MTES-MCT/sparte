{{ config(materialized="table") }}

/*

Ce modèle permet de lier les zonages d'urbanisme aux communes.
Un zonage peut appartenir à plusieurs communes si sa géométrie
intersecte plusieurs polygones de communes.

*/
select
    zc.commune_code as commune,
    commune.departement,
    commune.region,
    commune.epci,
    commune.ept,
    scot_communes.id_scot as scot,
    zonage_urbanisme.checksum as zonage_checksum,
    zonage_urbanisme.geom
from {{ ref("zonage_urbanisme") }}
inner join
    {{ ref("commune") }}
    on st_intersects(commune.geom, zonage_urbanisme.geom)
    and zonage_urbanisme.srid_source = commune.srid_source
left join {{ ref("scot_communes") }} on commune.code = scot_communes.commune_code
