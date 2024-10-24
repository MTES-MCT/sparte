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
        '60054',
        -- erreurs données source
        '14712',
        '14666',
        '52332',
        '52465',
        '52033',
        '52504',
        '52124',
        '52031',
        '52278',
        '55298',
        '55138',
        '76676',
        '76601'
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
    -- Erreurs données source
    union
    {{ divide_majic('14712', '14712', 68.85) }}
    union
    {{ divide_majic('14712', '14666', 31.15) }}
    union
    {{ divide_majic('52332', '52465', 8.78) }}
    union
    {{ divide_majic('52332', '52033', 8.18) }}
    union
    {{ divide_majic('52332', '52332', 83.04) }}
    union
    {{ divide_majic('52504', '52504', 54.25) }}
    union
    {{ divide_majic('52504', '52124', 45.75) }}
    union
    {{ divide_majic('52031', '52031', 75.13) }}
    union
    {{ divide_majic('52031', '52278', 24.87) }}
    union
    {{ divide_majic('55298', '55298', 55.01) }}
    union
    {{ divide_majic('55298', '55138', 44.99) }}
    union
    {{ divide_majic('76676', '76676', 66.69) }}
    union
    {{ divide_majic('76676', '76601', 33.31) }}
    -- absence donnée source
    union
    {{ divide_majic('76676', '09304', 0) }}
    union
    {{ divide_majic('76676', '29083', 0) }}
    union
    {{ divide_majic('76676', '29084', 0) }}
),
together as (
select * from unchanged_conso
union all
select * from fusions
union all
select * from divisions
)
select
    *,
    (
        conso_2011_2012 +
        conso_2012_2013 +
        conso_2013_2014 +
        conso_2014_2015 +
        conso_2015_2016 +
        conso_2016_2017 +
        conso_2017_2018 +
        conso_2018_2019 +
        conso_2019_2020 +
        conso_2020_2021
    ) as conso_2011_2021,
    (
        conso_2011_2012_activite +
        conso_2012_2013_activite +
        conso_2013_2014_activite +
        conso_2014_2015_activite +
        conso_2015_2016_activite +
        conso_2016_2017_activite +
        conso_2017_2018_activite +
        conso_2018_2019_activite +
        conso_2019_2020_activite +
        conso_2020_2021_activite
    ) as conso_2011_2021_activite,
    (
        conso_2011_2012_habitat +
        conso_2012_2013_habitat +
        conso_2013_2014_habitat +
        conso_2014_2015_habitat +
        conso_2015_2016_habitat +
        conso_2016_2017_habitat +
        conso_2017_2018_habitat +
        conso_2018_2019_habitat +
        conso_2019_2020_habitat +
        conso_2020_2021_habitat
    )  as conso_2011_2021_habitat
from
    together
