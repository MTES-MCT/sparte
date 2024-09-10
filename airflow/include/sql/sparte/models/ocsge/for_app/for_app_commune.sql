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
    commune.id,
    commune.insee,
    commune.departement_id,
    commune.epci_id,
    commune.scot_id,
    commune.map_color,
    case
        when
            millesimes.first_millesime is not NULL
            then millesimes.first_millesime
        when commune.name is NULL then 2016
    end                                                as first_millesime,
    case
        when
            millesimes.last_millesime is not NULL
            then millesimes.last_millesime
        when commune.name is NULL then 2019
    end                                                as last_millesime,
    coalesce(admin_express_commune.name, commune.name) as name,  -- noqa: L029
    coalesce(admin_express_commune.srid_source, 2154)  as srid_source,
    case
        when artif_commune.surface is not NULL then TRUE
        when commune.name is NULL then TRUE
        else FALSE
    end                                                as ocsge_available,
    case
        when
            artif_commune.surface is not NULL
            then artif_commune.surface / 10000
    end                                                as surface_artif,
    case
        when
            admin_express_commune.surface is not NULL
            then admin_express_commune.surface / 10000
        else
            0
    end                                                as area,
    case
        when
            admin_express_commune.geom is not NULL
            then st_transform(admin_express_commune.geom, 4326)
        else
            st_setsrid('MULTIPOLYGON EMPTY'::geometry, 4326)
    end                                                as mpoly
from
    {{ ref('app_commune') }} as commune
left join
    latest_year_artif_commune as artif_commune
    on
        commune.insee = artif_commune.commune_code
left join
    first_and_last_millesimes as millesimes
    on
        commune.insee = millesimes.commune_code
left join
    {{ ref('commune') }} as admin_express_commune
    on
        commune.insee = admin_express_commune.code
