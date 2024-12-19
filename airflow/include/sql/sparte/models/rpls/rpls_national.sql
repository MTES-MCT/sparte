{{ config(materialized='table') }}

{% set paris = [
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
] %}

{% set lyon = [
	'69381',
	'69382',
	'69383',
	'69384',
	'69385',
	'69386',
	'69387',
	'69388',
	'69389'
] %}

{% set marseille = [
	'13201',
	'13202',
	'13203',
	'13204',
	'13205',
	'13206',
	'13207',
	'13208',
	'13209',
	'13210',
	'13211',
	'13212',
	'13213',
	'13214',
	'13215',
	'13216'
] %}

{% set mayotte = [
	'97607',
	'97611',
	'97605',
	'97614',
	'97617',
	'97610',
	'97616',
	'97609',
	'97602',
	'97608',
	'97606',
	'97603',
	'97615',
	'97604'
] %}

with raw_data as (
SELECT
    "Commune (DEP)" as commune_name,
    "Unnamed: 2" as commune_code,
    nb_loues as nombre_loues,
    nb_vacants as nombre_vacants,
    nb_vides as nombre_vides
    /*
	nb_asso,
	nb_occup_finan,
	nb_occup_temp,
	nb_ls,
	parc_non_conv,
	nb_lgt_tot,
	densite,
	nb_ls_en_qpv,
	nb_ls_individuels,
	nb_ls_collectifs,
	nb_ls_1piece,
	nb_ls_2piece,
	nb_ls_3piece,
	nb_ls_4piece,
	nb_ls_5piece_plus,
	nb_ls_plai,
	nb_ls_plus_av_77,
	nb_ls_plus_ap_77,
	nb_ls_pls,
	nb_ls_pli,
	nb_ls2022,
	nb_ls2021,
	nb_ls2020,
	nb_ls2019,
	nb_ls2018,
	nb_ls2017,
	nb_ls2016,
	nb_ls2015,
	nb_ls2014,
	nb_ls2013,
	evol_2022,
	evol_2021,
	evol_2020,
	evol_2019,
	evol_2018,
	evol_2017,
	evol_2016,
	evol_2015,
	evol_2014,
	evol_2013,
	nv_mes,
	nv_mes_2022,
	nv_mes_2021,
	nv_mes_2020,
	nv_mes_2019,
	nv_mes_2018,
	nv_mes_2017,
	nv_mes_2016,
	nv_mes_2015,
	nv_mes_2014,
	nv_mes_2013,
	nb_ls_const_org,
	nb_ls_av_trav,
	nb_ls_ss_trav,
	nb_ls_vefa,
	nb_ls_vendu_occupant,
	nb_ls_vendu_autre_bailleur,
	nb_ls_autre_vente,
	nb_ls_demolition,
	nb_ls_sortie_autre_motif,
	nb_ls_chgt_usage,
	nb_ls_fusion_scission,
	age,
	age_inf_5,
	age_5_10,
	age_10_20,
	age_20_40,
	age_40_60,
	age_60_plus,
	"2018",
	"2019",
	"2020",
	"2021",
	"2022",
	"2023",
	nb_ls_individuels_recent,
	nb_ls_collectifs_recent,
	nb_neuf,
	nb_ls_1piece_recent,
	nb_ls_2piece_recent,
	nb_ls_3piece_recent,
	nb_ls_4piece_recent,
	nb_ls_5piece_plus_recent,
	nb_ls_en_qpv_recent,
	nb_ls_plai_recent,
	nb_ls_plus_recent,
	nb_ls_pls_recent,
	nb_ls_pli_recent,
	"ener_AB",
	"serre_AB",
	nb_loues_vacant,
	tx_vac,
	tx_vac_2022,
	tx_vac_2021,
	tx_vac_2020,
	tx_vac_2019,
	tx_vac_2018,
	tx_vac_2017,
	tx_vac_2016,
	tx_vac_2015,
	tx_vac_2014,
	tx_vac_2013,
	tx_vac3,
	tx_vac_3_2022,
	tx_vac_3_2021,
	tx_vac_3_2020,
	tx_vac_3_2019,
	tx_vac_3_2018,
	tx_vac_3_2017,
	tx_vac_3_2016,
	tx_vac_3_2015,
	tx_vac_3_2014,
	tx_vac_3_2013,
	tx_mob,
	tx_mob_2022,
	tx_mob_2021,
	tx_mob_2020,
	tx_mob_2019,
	tx_mob_2018,
	tx_mob_2017,
	tx_mob_2016,
	tx_mob_2015,
	tx_mob_2014,
	tx_mob_2013,
	loymoy,
	loymoy_2022,
	loymoy_2021,
	loymoy_2020,
	loymoy_2019,
	loymoy_2018,
	loymoy_2017,
	loymoy_2016,
	loymoy_2015,
	loymoy_2014,
	loymoy_2013,
	evol_loyer2022,
	evol_loyer2021,
	evol_loyer2020,
	evol_loyer2019,
	evol_loyer2018,
	evol_loyer2017,
	evol_loyer2016,
	evol_loyer2015,
	evol_loyer2014,
	evol_loyer2013,
	loymoy_q2,
	loymoy_q4,
	loymoy_r,
	loymoy_plai,
	loymoy_plus_ap,
	loymoy_plus_av,
	loymoy_pls,
	loymoy_pli,
	loymoy_inf_5,
	loymoy_5_10,
	loymoy_10_20,
	loymoy_20_40,
	loymoy_40_60,
	loymoy_60_plus,
	"serre_A",
	"serre_B",
	"serre_C",
	"serre_D",
	"serre_E",
	"serre_F",
	"serre_G",
	"serre_NR",
	"ener_A",
	"ener_B",
	"ener_C",
	"ener_D",
	"ener_E",
	"ener_F",
	"ener_G",
	"ener_NR",
	"ener_A_new",
	"ener_B_new",
	"ener_C_new",
	"ener_D_new",
	"ener_E_new",
	"ener_F_new",
	"ener_G_new",
	"ener_NR_new",
	nb_dpe_realise,
	perc_dpe_realise
    */
	FROM
{{ source('public', 'rpls_rpls_national') }}
)
SELECT * FROM raw_data
WHERE commune_code not in (
	{% for code in paris %}
		'{{ code }}',
	{% endfor %}
	{% for code in lyon %}
		'{{ code }}',
	{% endfor %}
	{% for code in marseille %}
		'{{ code }}',
	{% endfor %}
	{% for code in mayotte %}
		'{{ code }}'
		{% if not loop.last %},{% endif %}
	{% endfor %}
    )
UNION
SELECT
    'Paris (75)' as commune_name,
    '75056' as commune_code,
    sum(nombre_loues) as nombre_loues,
    sum(nombre_vacants) as nombre_vacants,
    sum(nombre_vides) as nombre_vides
FROM
    raw_data
WHERE commune_code in (
	{% for code in paris %}
		'{{ code }}'
		{% if not loop.last %},{% endif %}
	{% endfor %}
    )
UNION
SELECT
    'Lyon (69)' as commune_name,
    '69123' as commune_code,
    sum(nombre_loues) as nombre_loues,
    sum(nombre_vacants) as nombre_vacants,
    sum(nombre_vides) as nombre_vides
FROM
    raw_data
WHERE
    commune_code in (
	{% for code in lyon %}
		'{{ code }}'
		{% if not loop.last %},{% endif %}
	{% endfor %}
    )
UNION
SELECT
    'Marseille (13)',
    '13055' as commune_code,
    sum(nombre_loues) as nombre_loues,
    sum(nombre_vacants) as nombre_vacants,
    sum(nombre_vides) as nombre_vides
FROM
    raw_data
WHERE commune_code in (
	{% for code in marseille %}
		'{{ code }}'
		{% if not loop.last %},{% endif %}
	{% endfor %}
)
