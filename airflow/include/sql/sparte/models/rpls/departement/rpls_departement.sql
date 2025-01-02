{{ config(materialized='table') }}

{% set columns = '
total_2023,
total_2022,
total_2021,
total_2020,
total_2019,
total_2018,
total_2017,
total_2016,
total_2015,
total_2014,
total_2013,
taux_vacants_2023,
taux_vacants_2022,
taux_vacants_2021,
taux_vacants_2020,
taux_vacants_2019,
taux_vacants_2018,
taux_vacants_2017,
taux_vacants_2016,
taux_vacants_2015,
taux_vacants_2014,
taux_vacants_2013
' %}

SELECT
    "LIBDEP"::text as departement_name,
    "DEP"::text as departement_code,
    COALESCE(nb_ls, 0) 				    as total_2023,
	COALESCE(nb_ls2022, 0) 				as total_2022,
	COALESCE(nb_ls2021, 0) 				as total_2021,
	COALESCE(nb_ls2020, 0) 				as total_2020,
	COALESCE(nb_ls2019, 0) 				as total_2019,
	COALESCE(nb_ls2018, 0) 				as total_2018,
	COALESCE(nb_ls2017, 0) 				as total_2017,
	COALESCE(nb_ls2016, 0) 				as total_2016,
	COALESCE(nb_ls2015, 0) 				as total_2015,
	COALESCE(nb_ls2014, 0) 				as total_2014,
	COALESCE(nb_ls2013, 0) 				as total_2013,

	COALESCE(tx_vac3, 0) 				as taux_vacants_2023,
	COALESCE(tx_vac_3_2022, 0) 			as taux_vacants_2022,
	COALESCE(tx_vac_3_2021, 0) 			as taux_vacants_2021,
	COALESCE(tx_vac_3_2020, 0) 			as taux_vacants_2020,
	COALESCE(tx_vac_3_2019, 0) 			as taux_vacants_2019,
	COALESCE(tx_vac_3_2018, 0) 			as taux_vacants_2018,
	COALESCE(tx_vac_3_2017, 0) 			as taux_vacants_2017,
	COALESCE(tx_vac_3_2016, 0) 			as taux_vacants_2016,
	COALESCE(tx_vac_3_2015, 0) 			as taux_vacants_2015,
	COALESCE(tx_vac_3_2014, 0) 			as taux_vacants_2014,
	COALESCE(tx_vac_3_2013, 0) 			as taux_vacants_2013
FROM
    {{ source('public', 'rpls_rpls_departement') }}
UNION
    SELECT
        region_name as departement_name,
        '971' as departement_code,
        {{ columns }}
    FROM
        {{ ref('rpls_region')}}
    WHERE
        region_code = '01'
UNION
    SELECT
        region_name as departement_name,
        '972' as departement_code,
        {{ columns }}
    FROM
        {{ ref('rpls_region')}}
    WHERE
        region_code = '02'
UNION
    SELECT
        region_name as departement_name,
        '973' as departement_code,
        {{ columns }}
    FROM
        {{ ref('rpls_region')}}
    WHERE
        region_code = '03'
UNION
    SELECT
        region_name as departement_name,
        '974' as departement_code,
        {{ columns }}
    FROM
        {{ ref('rpls_region')}}
    WHERE
        region_code = '04'
/*
    Mayotte n'est pas encore pris en compte sur notre plateforme

UNION
    SELECT
        region_name as departement_name,
        '976' as departement_code,
        {{ columns }}
    FROM
        {{ ref('rpls_region')}}
    WHERE
        region_code = '6'
*/
