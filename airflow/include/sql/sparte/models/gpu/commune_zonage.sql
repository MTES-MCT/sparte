{{ config(materialized="table") }}

/*

Ce modèle permet de lier les zonages d'urbanisme aux communes.
Comme les géomètres des zonages sont imprécis, la jointure ne se fait pas
sur la base d'une intersection du polygone de la commune avec le polygone du zonage,
mais lorsqu'un point du zonage (obtenu avec la fonction ST_PointOnSurface)
est contenu dans le polygone de la commune.

*/

with
    zonages_as_points as (
        select checksum, st_pointonsurface(geom) as geom, srid_source
        from {{ ref("zonage_urbanisme") }}
    )
select
    commune.code as commune,
    commune.departement,
    commune.region,
    commune.epci,
    commune.ept,
    scot_communes.id_scot as scot,
    zonages_as_points.checksum as zonage_checksum,
    zonages_as_points.geom
from zonages_as_points
left join
    {{ ref("commune") }}
    on st_contains(commune.geom, zonages_as_points.geom)
    and zonages_as_points.srid_source = commune.srid_source
left join {{ ref("scot_communes") }} on commune.code = scot_communes.commune_code
where commune.code is not null
