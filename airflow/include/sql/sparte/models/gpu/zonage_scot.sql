{{ config(materialized="table") }}

select distinct
    zc.zonage_checksum,
    scot_communes.id_scot as scot_code
from {{ ref("zonage_commune") }} zc
inner join {{ ref("scot_communes") }} on scot_communes.commune_code = zc.commune_code
where scot_communes.id_scot is not null
