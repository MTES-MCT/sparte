{{
    config(
        materialized='table',
        indexes=[{'columns': ['code_commune'], 'type': 'btree'}]
    )
}}


with unchanged as (
    select * from {{ ref('population') }}
    where code_commune not in (
        '08294',
        '08053',
        '16355',
        '16097',
        '18131',
        '18173',
        '25282',
        '25060',
        '25549',
        '25060',
        '35112',
        '35062',
        '49321',
        '49160',
        '64541',
        '64300',
        '69152',
        '69149',
        '85041',
        '85292',
        '85271',
        '86231',
        '86247',
        '95282',
        '95169',
        '85084',
        '85165',
        '85212',
        '60054',
        '60054',
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
fusions as (
    {{ merge_population('08053', ['08294']) }}
    union
    {{ merge_population('16097', ['16355']) }}
    union
    {{ merge_population('18173', ['18131']) }}
    union
    {{ merge_population('25060', ['25282', '25549']) }}
    union
    {{ merge_population('35062', ['35112']) }}
    union
    {{ merge_population('49160', ['49321']) }}
    union
    {{ merge_population('64300', ['64541']) }}
    union
    {{ merge_population('69149', ['69152']) }}
    union
    {{ merge_population('85292', ['85041', '85271']) }}
    union
    {{ merge_population('86247', ['86231']) }}
    union
    {{ merge_population('95169', ['95282']) }}
),
divisions as (
    {{ divide_population('85084', '85084', 68.57) }}
    union
    {{ divide_population('85084', '85165', 14.20) }}
    union
    {{ divide_population('85084', '85212', 17.23) }}
    union
    {{ divide_population('60054', '60054', 42.24) }}
    union
    {{ divide_population('60054', '60694', 57.76) }}
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
    select * from fusions
    union all
    select * from divisions
    union all
    select * from paris
)
select * from together
