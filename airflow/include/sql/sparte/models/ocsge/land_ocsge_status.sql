{{
    config(materialized="table")
}}

with
    raw_status as (
        select
            land_departement.land_id as land_id,
            land_departement.land_type as land_type,
            count(distinct land_departement.departement) as departement_count,
            (
                select count(*)
                from {{ ref('land_millesimes') }} as t
                where
                    land_departement.land_id = t.land_id
                    and land_departement.land_type = t.land_type
            ) as index_count
        from {{ ref('land_departement') }}
        group by land_departement.land_id, land_departement.land_type
    ),
without_simplified_status as (
select
    land_id,
    land_type,
    departement_count,
    index_count,
    case
        when departement_count = 1 and departement_count * 2 = index_count
        then 'COMPLETE_UNIFORM'
        when departement_count > 1 and departement_count * 2 = index_count
        then 'COMPLETE_NOT_UNIFORM'
        when
            departement_count > 1
            and index_count > 1
            and departement_count * 2 > index_count
        then 'PARTIAL'
        when index_count = 0
        then 'NO_DATA'
        else 'UNDEFINED'
    end as status
from raw_status
order by land_type desc
)
select
    land_id,
    land_type,
    departement_count,
    index_count,
    status,
    CASE
        when status = 'COMPLETE_UNIFORM' THEN true
        when status = 'COMPLETE_NOT_UNIFORM' THEN true
        else false
    end as has_ocsge
from without_simplified_status
