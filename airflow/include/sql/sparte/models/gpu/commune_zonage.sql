{{ config(materialized="table") }}

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
    zonages_as_points.checksum as zonage_checksum
from zonages_as_points
inner join
    {{ ref("commune") }}
    on st_contains(commune.geom, zonages_as_points.geom)
    and zonages_as_points.srid_source = commune.srid_source
left join {{ ref("scot_communes") }} on commune.code = scot_communes.commune_code
