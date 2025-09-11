{{
    config(
        materialized='table',
        docs={'node_color': 'purple'}
    )
}}

with first_and_last_millesimes as (
    select
        commune_code,
        min(year) as first_millesime,
        max(year) as last_millesime
    from
        {{ ref('occupation_du_sol_commune') }}
    group by
        commune_code
), autorisation_logement_summary as (
    SELECT DISTINCT land_id
    FROM {{ ref('for_app_autorisationlogement') }}
    WHERE land_type = '{{ var('COMMUNE') }}'
), logement_vacants_summary as (
    SELECT DISTINCT land_id
    FROM {{ ref('for_app_logementvacant') }}
    WHERE land_type = '{{ var('COMMUNE') }}'
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
    commune.surface / 10000 as area,
    ST_Transform(commune.geom, 4326) as mpoly,
    consommation.correction_status as consommation_correction_status,
    competence.competence_planification,
    commune.code in (
        select land_id
        from autorisation_logement_summary
    ) as autorisation_logement_available,
    commune.code in (
        select land_id
        from logement_vacants_summary
    ) as logements_vacants_available
from
    {{ ref('commune') }} as commune
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
left join
    {{ ref('competence_plan_commune')}} as competence
    on
        commune.code = competence.commune_code
