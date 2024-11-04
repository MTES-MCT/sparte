{{
    config(
        materialized='table',
        indexes=[{'columns': ['code_commune'], 'type': 'btree'}]
    )
}}


select
    "CODGEO" as code_commune,
    "LIBGEO" as nom_commune,
    "PMUN2021" as population_2021,
    "PMUN2020" as population_2020,
    "PMUN2019" as population_2019,
    "PMUN2018" as population_2018,
    "PMUN2017" as population_2017,
    "PMUN2016" as population_2016,
    "PMUN2015" as population_2015,
    "PMUN2014" as population_2014,
    "PMUN2013" as population_2013,
    "PMUN2012" as population_2012,
    "PMUN2011" as population_2011,
    "PMUN2010" as population_2010,
    "PMUN2009" as population_2009
FROM
{{ source('public', 'insee_population') }}
