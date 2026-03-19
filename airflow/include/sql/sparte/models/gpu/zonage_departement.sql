{{ config(materialized="table") }}

select distinct
    zc.zonage_checksum,
    commune.departement as departement_code
from {{ ref("zonage_commune") }} zc
inner join {{ ref("commune") }} as commune on commune.code = zc.commune_code
where commune.departement is not null
