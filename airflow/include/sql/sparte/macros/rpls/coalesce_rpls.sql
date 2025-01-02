{% macro coalesce_rpls() %}

    COALESCE(nb_ls, 0) 				as total_2023,
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

{% endmacro %}
