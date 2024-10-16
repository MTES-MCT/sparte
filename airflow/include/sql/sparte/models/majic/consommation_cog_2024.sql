{{ config(materialized='table') }}

with unchanged_conso as (
    select * from {{ ref('consommation') }}
    where commune_code not in (
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
        '60054'
    )
),

fusions as (
    {{ merge_majic('08053', ['08294']) }}
    union
    {{ merge_majic('16097', ['16355']) }}
    union
    {{ merge_majic('18173', ['18131']) }}
    union
    {{ merge_majic('25060', ['25282', '25549']) }}
    union
    {{ merge_majic('35062', ['35112']) }}
    union
    {{ merge_majic('49160', ['49321']) }}
    union
    {{ merge_majic('64300', ['64541']) }}
    union
    {{ merge_majic('69149', ['69152']) }}
    union
    {{ merge_majic('85292', ['85041', '85271']) }}
    union
    {{ merge_majic('86247', ['86231']) }}
    union
    {{ merge_majic('95169', ['95282']) }}
),

divisions as (
    {{ divide_majic('85084', '85084', 68.57) }}
    union
    {{ divide_majic('85084', '85165', 14.20) }}
    union
    {{ divide_majic('85084', '85212', 17.23) }}
    union
    {{ divide_majic('60054', '60054', 42.24) }}
    union
    {{ divide_majic('60054', '60694', 57.76) }}
)

select * from unchanged_conso
union all
select * from fusions
union all
select * from divisions
