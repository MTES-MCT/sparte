{{ config(materialized="table") }}

select distinct
    zc.zonage_checksum,
    commune.epci as epci_code
from {{ ref("zonage_commune") }} zc
inner join {{ ref("commune") }} as commune on commune.code = zc.commune_code
where commune.epci is not null
