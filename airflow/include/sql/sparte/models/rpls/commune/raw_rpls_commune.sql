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
	{{ coalesce_rpls() }}
	FROM
{{ source('public', 'rpls_rpls_commune') }}
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
	{{ sum_rpls() }}
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
    {{ sum_rpls() }}
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
    {{ sum_rpls() }}
FROM
    raw_data
WHERE commune_code in (
	{% for code in marseille %}
		'{{ code }}'
		{% if not loop.last %},{% endif %}
	{% endfor %}
)
