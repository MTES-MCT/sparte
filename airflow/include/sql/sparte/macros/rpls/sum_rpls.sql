{% macro sum_rpls() %}

    sum(total_2023) 		as total_2023,
	sum(total_2022)			as total_2022,
	sum(total_2021) 		as total_2021,
	sum(total_2020) 		as total_2020,
	sum(total_2019) 		as total_2019,
	sum(total_2018) 		as total_2018,
	sum(total_2017) 		as total_2017,
	sum(total_2016) 		as total_2016,
	sum(total_2015) 		as total_2015,
	sum(total_2014) 		as total_2014,
	sum(total_2013) 		as total_2013,
	sum(taux_vacants_2023) 	as taux_vacants_2023,
	sum(taux_vacants_2022) 	as taux_vacants_2022,
	sum(taux_vacants_2021) 	as taux_vacants_2021,
	sum(taux_vacants_2020) 	as taux_vacants_2020,
	sum(taux_vacants_2019) 	as taux_vacants_2019,
	sum(taux_vacants_2018) 	as taux_vacants_2018,
	sum(taux_vacants_2017) 	as taux_vacants_2017,
	sum(taux_vacants_2016) 	as taux_vacants_2016,
	sum(taux_vacants_2015) 	as taux_vacants_2015,
	sum(taux_vacants_2014) 	as taux_vacants_2014,
	sum(taux_vacants_2013) 	as taux_vacants_2013

{% endmacro %}
