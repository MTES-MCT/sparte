{{ config(materialized='table', indexes=[{'columns': ['land_id', 'land_type'], 'type': 'btree'}]) }}

{%- set columns = [] -%}

{# Population et logement P06 #}
{%- for name in ['population', 'logements', 'residences_principales', 'residences_secondaires', 'logements_vacants'] -%}
{%- do columns.append(name ~ '_06') -%}
{%- endfor -%}
{%- do columns.append('pop_menages_06') -%}

{# D99-D68 #}
{%- for year in ['99', '90', '82', '75', '68'] -%}
{%- for name in ['population', 'logements', 'residences_principales', 'residences_secondaires', 'logements_vacants'] -%}
{%- do columns.append(name ~ '_' ~ year) -%}
{%- endfor -%}
{%- endfor -%}
{%- do columns.append('pop_menages_99') -%}
{%- for year in ['90', '82', '75', '68'] -%}
{%- do columns.append('nb_personnes_rp_' ~ year) -%}
{%- endfor -%}
{%- do columns.append('superficie') -%}

{# Naissances/décès inter-censitaires #}
{%- for period in ['2016_2021', '2011_2015', '2006_2010', '1999_2005', '1990_1999', '1982_1990', '1975_1982', '1968_1975'] -%}
{%- do columns.append('naissances_' ~ period) -%}
{%- do columns.append('deces_' ~ period) -%}
{%- endfor -%}

{# Naissances/décès annuels #}
{%- for year_num in range(14, 25) -%}
{%- do columns.append('naissances_domiciliees_20' ~ year_num) -%}
{%- do columns.append('deces_domicilies_20' ~ year_num) -%}
{%- endfor -%}

{{ aggregate_dc_to_land('dc_historique', columns) }}
