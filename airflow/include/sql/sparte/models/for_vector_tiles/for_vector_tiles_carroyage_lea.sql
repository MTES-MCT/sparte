{{
    config(
        materialized="table",
    )
}}

SELECT
    carroyage.idcarreau,
    -- 2011
    carroyage.conso_2011,
    carroyage.conso_2011_habitat,
    carroyage.conso_2011_activite,
    carroyage.conso_2011_mixte,
    carroyage.conso_2011_route,
    carroyage.conso_2011_ferroviaire,
    carroyage.conso_2011_inconnu,
    -- 2012
    carroyage.conso_2012,
    carroyage.conso_2012_habitat,
    carroyage.conso_2012_activite,
    carroyage.conso_2012_mixte,
    carroyage.conso_2012_route,
    carroyage.conso_2012_ferroviaire,
    carroyage.conso_2012_inconnu,
    -- 2013
    carroyage.conso_2013,
    carroyage.conso_2013_habitat,
    carroyage.conso_2013_activite,
    carroyage.conso_2013_mixte,
    carroyage.conso_2013_route,
    carroyage.conso_2013_ferroviaire,
    carroyage.conso_2013_inconnu,
    -- 2014
    carroyage.conso_2014,
    carroyage.conso_2014_habitat,
    carroyage.conso_2014_activite,
    carroyage.conso_2014_mixte,
    carroyage.conso_2014_route,
    carroyage.conso_2014_ferroviaire,
    carroyage.conso_2014_inconnu,
    -- 2015
    carroyage.conso_2015,
    carroyage.conso_2015_habitat,
    carroyage.conso_2015_activite,
    carroyage.conso_2015_mixte,
    carroyage.conso_2015_route,
    carroyage.conso_2015_ferroviaire,
    carroyage.conso_2015_inconnu,
    -- 2016
    carroyage.conso_2016,
    carroyage.conso_2016_habitat,
    carroyage.conso_2016_activite,
    carroyage.conso_2016_mixte,
    carroyage.conso_2016_route,
    carroyage.conso_2016_ferroviaire,
    carroyage.conso_2016_inconnu,
    -- 2017
    carroyage.conso_2017,
    carroyage.conso_2017_habitat,
    carroyage.conso_2017_activite,
    carroyage.conso_2017_mixte,
    carroyage.conso_2017_route,
    carroyage.conso_2017_ferroviaire,
    carroyage.conso_2017_inconnu,
    -- 2018
    carroyage.conso_2018,
    carroyage.conso_2018_habitat,
    carroyage.conso_2018_activite,
    carroyage.conso_2018_mixte,
    carroyage.conso_2018_route,
    carroyage.conso_2018_ferroviaire,
    carroyage.conso_2018_inconnu,
    -- 2019
    carroyage.conso_2019,
    carroyage.conso_2019_habitat,
    carroyage.conso_2019_activite,
    carroyage.conso_2019_mixte,
    carroyage.conso_2019_route,
    carroyage.conso_2019_ferroviaire,
    carroyage.conso_2019_inconnu,
    -- 2020
    carroyage.conso_2020,
    carroyage.conso_2020_habitat,
    carroyage.conso_2020_activite,
    carroyage.conso_2020_mixte,
    carroyage.conso_2020_route,
    carroyage.conso_2020_ferroviaire,
    carroyage.conso_2020_inconnu,
    -- 2021
    carroyage.conso_2021,
    carroyage.conso_2021_habitat,
    carroyage.conso_2021_activite,
    carroyage.conso_2021_mixte,
    carroyage.conso_2021_route,
    carroyage.conso_2021_ferroviaire,
    carroyage.conso_2021_inconnu,
    -- 2022
    carroyage.conso_2022,
    carroyage.conso_2022_habitat,
    carroyage.conso_2022_activite,
    carroyage.conso_2022_mixte,
    carroyage.conso_2022_route,
    carroyage.conso_2022_ferroviaire,
    carroyage.conso_2022_inconnu,
    -- 2023
    carroyage.conso_2023,
    carroyage.conso_2023_habitat,
    carroyage.conso_2023_activite,
    carroyage.conso_2023_mixte,
    carroyage.conso_2023_route,
    carroyage.conso_2023_ferroviaire,
    carroyage.conso_2023_inconnu,
    -- Géométrie (transformée de EPSG:3035 vers EPSG:4326)
    st_transform(geom, 4326) as geom,
    -- Territoires
    communes.communes as "{{ var('COMMUNE')}}",
    communes.epcis as "{{ var('EPCI')}}",
    communes.departements as "{{ var('DEPARTEMENT')}}",
    communes.regions as "{{ var('REGION')}}",
    communes.scots as "{{ var('SCOT')}}",
    custom_lands.custom_lands as "{{ var('CUSTOM')}}"
FROM
    {{ ref("carroyage_lea") }} as carroyage
LEFT JOIN LATERAL (
    SELECT
        array_agg(DISTINCT commune.code) as communes,
        array_agg(DISTINCT commune.epci) as epcis,
        array_agg(DISTINCT commune.departement) as departements,
        array_agg(DISTINCT commune.region) as regions,
        array_agg(DISTINCT commune.scot) as scots
    FROM
        {{ ref('commune') }} as commune
    WHERE
        st_intersects(commune.geom_4326, st_transform(st_setsrid(carroyage.geom, 3035), 4326))
) communes ON TRUE
LEFT JOIN LATERAL (
    SELECT array_agg(DISTINCT ccl.custom_land_id) as custom_lands
    FROM
        {{ ref('commune_custom_land') }} as ccl
    WHERE
        ccl.commune_code = ANY(communes.communes)
) custom_lands ON TRUE
WHERE
    carroyage.geom IS NOT NULL
