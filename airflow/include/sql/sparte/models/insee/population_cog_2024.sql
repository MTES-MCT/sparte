{{
    config(
        materialized='table',
        indexes=[{'columns': ['code_commune'], 'type': 'btree'}]
    )
}}


with unchanged as (
    select * from {{ ref('population') }}
    where code_commune not in (
        -- Arrondissements de paris
        '75101',
        '75102',
        '75103',
        '75104',
        '75105',
        '75106',
        '75107',
        '75108',
        '75109',
        '75110',
        '75111',
        '75112',
        '75113',
        '75114',
        '75115',
        '75116',
        '75117',
        '75118',
        '75119',
        '75120'
    )
),
paris as (
    {{ merge_population('75056', [
        '75101',
        '75102',
        '75103',
        '75104',
        '75105',
        '75106',
        '75107',
        '75108',
        '75109',
        '75110',
        '75111',
        '75112',
        '75113',
        '75114',
        '75115',
        '75116',
        '75117',
        '75118',
        '75119',
        '75120'
    ]) }}
),
together as (
    select * from unchanged
    union all
    select * from paris
)
select * from together
