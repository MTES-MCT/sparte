{{
    config(
        materialized='table',
        docs={'node_color': 'purple'}
    )
}}

SELECT
    consommation.commune_code as city_insee,
    commune.name as city_name,
    region.name as region_name,
    region.code as region_id,
    departement.code as dept_id,
    departement.name as dept_name,
    commune.epci as epci_id,
    epci.name as epci_name,
    scot.id_scot as scot,
    conso_2009_2023 as art09inc23,
    conso_2009_2023_ferroviaire as art09fer23,
    conso_2009_2023_route as art09rou23,
    conso_2009_2023_mixte as art09mix23,
    conso_2009_2023_habitat as art09hab23,
    conso_2009_2023_activite as art09act23,
    conso_2022_inconnu as art22inc23,
    conso_2022_ferroviaire as art22fer23,
    conso_2022_route as art22rou23,
    conso_2022_mixte as art22mix23,
    conso_2022_habitat as art22hab23,
    conso_2022_activite as art22act23,
    conso_2022 as naf22art23,
    conso_2021_inconnu as art21inc22,
    conso_2021_ferroviaire as art21fer22,
    conso_2021_route as art21rou22,
    conso_2021_mixte as art21mix22,
    conso_2021_habitat as art21hab22,
    conso_2021_activite as art21act22,
    conso_2021 as naf21art22,
    conso_2020_inconnu as art20inc21,
    conso_2020_ferroviaire as art20fer21,
    conso_2020_route as art20rou21,
    conso_2020_mixte as art20mix21,
    conso_2020_habitat as art20hab21,
    conso_2020_activite as art20act21,
    conso_2020 as naf20art21,
    conso_2019_inconnu as art19inc20,
    conso_2019_ferroviaire as art19fer20,
    conso_2019_route as art19rou20,
    conso_2019_mixte as art19mix20,
    conso_2019_habitat as art19hab20,
    conso_2019_activite as art19act20,
    conso_2019 as naf19art20,
    conso_2018_inconnu as art18inc19,
    conso_2018_ferroviaire as art18fer19,
    conso_2018_route as art18rou19,
    conso_2018_mixte as art18mix19,
    conso_2018_habitat as art18hab19,
    conso_2018_activite as art18act19,
    conso_2018 as naf18art19,
    conso_2017_inconnu as art17inc18,
    conso_2017_ferroviaire as art17fer18,
    conso_2017_route as art17rou18,
    conso_2017_mixte as art17mix18,
    conso_2017_habitat as art17hab18,
    conso_2017_activite as art17act18,
    conso_2017 as naf17art18,
    conso_2016_inconnu as art16inc17,
    conso_2016_ferroviaire as art16fer17,
    conso_2016_route as art16rou17,
    conso_2016_mixte as art16mix17,
    conso_2016_habitat as art16hab17,
    conso_2016_activite as art16act17,
    conso_2016 as naf16art17,
    conso_2015_inconnu as art15inc16,
    conso_2015_ferroviaire as art15fer16,
    conso_2015_route as art15rou16,
    conso_2015_mixte as art15mix16,
    conso_2015_habitat as art15hab16,
    conso_2015_activite as art15act16,
    conso_2015 as naf15art16,
    conso_2014_inconnu as art14inc15,
    conso_2014_ferroviaire as art14fer15,
    conso_2014_route as art14rou15,
    conso_2014_mixte as art14mix15,
    conso_2014_habitat as art14hab15,
    conso_2014_activite as art14act15,
    conso_2014 as naf14art15,
    conso_2013_inconnu as art13inc14,
    conso_2013_ferroviaire as art13fer14,
    conso_2013_route as art13rou14,
    conso_2013_mixte as art13mix14,
    conso_2013_habitat as art13hab14,
    conso_2013_activite as art13act14,
    conso_2013 as naf13art14,
    conso_2012_inconnu as art12inc13,
    conso_2012_ferroviaire as art12fer13,
    conso_2012_route as art12rou13,
    conso_2012_mixte as art12mix13,
    conso_2012_habitat as art12hab13,
    conso_2012_activite as art12act13,
    conso_2012 as naf12art13,
    conso_2011_inconnu as art11inc12,
    conso_2011_ferroviaire as art11fer12,
    conso_2011_route as art11rou12,
    conso_2011_mixte as art11mix12,
    conso_2011_habitat as art11hab12,
    conso_2011_activite as art11act12,
    conso_2011 as naf11art12,
    conso_2010_inconnu as art10inc11,
    conso_2010_ferroviaire as art10fer11,
    conso_2010_route as art10rou11,
    conso_2010_mixte as art10mix11,
    conso_2010_habitat as art10hab11,
    conso_2010_activite as art10act11,
    conso_2010 as naf10art11,
    conso_2009_inconnu as art09inc10,
    conso_2009_ferroviaire as art09fer10,
    conso_2009_route as art09rou10,
    conso_2009_mixte as art09mix10,
    conso_2009_habitat as art09hab10,
    conso_2009_activite as art09act10,
    conso_2009 as naf09art10,
    conso_2011_2021 as naf11art21,
    conso_2011_2021_inconnu as naf11inc21,
    conso_2011_2021_ferroviaire as naf11fer21,
    conso_2011_2021_route as naf11rou21,
    conso_2011_2021_mixte as naf11mix21,
    conso_2011_2021_activite as naf11act21,
    conso_2011_2021_habitat as naf11hab21,
    commune.srid_source as srid_source,
    {{ make_valid_multipolygon('ST_Transform(commune.geom, 4326)') }} as mpoly
FROM
    {{ ref("consommation_cog_2024") }} as consommation
LEFT JOIN
    {{ ref('commune') }} as commune
ON
    consommation.commune_code = commune.code
LEFT JOIN
    {{ ref('region') }} as region
ON
    commune.region = region.code
LEFT JOIN
    {{ ref('departement') }} as departement
ON
    commune.departement = departement.code
LEFT JOIN
    {{ ref('scot_communes') }} as scot
ON
    commune.code = scot.commune_code
LEFT JOIN
    {{ ref('epci') }} as epci
ON
    epci.code = commune.epci
