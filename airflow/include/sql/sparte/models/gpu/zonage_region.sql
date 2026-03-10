{{ config(materialized="table") }}

select distinct
    zc.zonage_checksum,
    commune.region as region_code
from {{ ref("zonage_commune") }} zc
inner join {{ ref("commune") }} as commune on commune.code = zc.commune_code
where commune.region is not null
