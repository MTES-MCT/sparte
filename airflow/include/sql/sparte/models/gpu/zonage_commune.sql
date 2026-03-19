{{ config(materialized="table") }}

/*
Table de mapping entre zonages et communes.
Un zonage peut apparaître dans plusieurs communes s'il chevauche une limite communale.
*/
select
    zonage.checksum as zonage_checksum,
    commune.code as commune_code
from {{ ref("zonage_urbanisme") }} as zonage
inner join {{ ref("commune") }} as commune
    on commune.srid_source = zonage.srid_source
    and st_intersects(commune.geom, zonage.geom)
