{{
    config(
        materialized='table',
        docs={'node_color': 'purple'}
    )
}}

with artif_commune_partitionned as (
    select
        *,
        row_number() over (partition by commune_code order by year desc) as rn
    from
        {{ ref('artificial_commune') }}

),

latest_year_artif_commune as (
    select *
    from
        artif_commune_partitionned
    where
        rn = 1
),

first_and_last_millesimes as (
    select
        commune_code,
        min(year) as first_millesime,
        max(year) as last_millesime
    from
        {{ ref('occupation_du_sol_commune') }}
    group by
        commune_code
)

select
    commune.code as insee,
    commune.departement as departement_id,
    commune.epci as epci_id,
    commune.ept as ept_id,
    scot.id_scot as scot_id,
    millesimes.first_millesime,
    millesimes.last_millesime,
    commune.name,
    commune.srid_source,
    millesimes.first_millesime is not NULL
    and millesimes.last_millesime is not NULL as ocsge_available,
    case
        when
            artif_commune.surface is not NULL
            then artif_commune.surface / 10000
            else NULL
    end    as surface_artif,
    commune.surface / 10000 as area,
    ST_Transform(commune.geom, 4326) as mpoly,
    consommation.correction_status as consommation_correction_status
from
    {{ ref('commune') }} as commune
left join
    latest_year_artif_commune as artif_commune
    on
        commune.code = artif_commune.commune_code
left join
    first_and_last_millesimes as millesimes
    on
        commune.code = millesimes.commune_code
left join
    {{ ref('scot_communes') }} as scot
    on
        commune.code = scot.commune_code
left join
    {{ ref("consommation_cog_2024") }} as consommation
    on
        commune.code = consommation.commune_code
