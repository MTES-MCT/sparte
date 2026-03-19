{{
    config(
        materialized='table',
        indexes=[{'columns': ['codgeo'], 'type': 'btree'}]
    )
}}

{# Données historiques : population, logement, naissances et décès #}

{# Population et logement historiques #}
{%- set hist_indicators = [
    ('POP', 'population'),
    ('LOG', 'logements'),
    ('RP', 'residences_principales'),
    ('RSECOCC', 'residences_secondaires'),
    ('LOGVAC', 'logements_vacants'),
] -%}

{%- set columns = [] -%}

{# P06 #}
{%- for var_code, var_name in hist_indicators -%}
{%- do columns.append(("P06_" ~ var_code, var_name ~ "_06")) -%}
{%- endfor -%}
{%- do columns.append(("P06_PMEN", "pop_menages_06")) -%}

{# D99, D90, D82, D75, D68 #}
{%- for year in ['99', '90', '82', '75', '68'] -%}
{%- for var_code, var_name in hist_indicators -%}
{%- do columns.append(("D" ~ year ~ "_" ~ var_code, var_name ~ "_" ~ year)) -%}
{%- endfor -%}
{%- endfor -%}

{# PMEN disponible pour D99 #}
{%- do columns.append(("D99_PMEN", "pop_menages_99")) -%}

{# NPER_RP disponible pour D90, D82, D75, D68 #}
{%- for year in ['90', '82', '75', '68'] -%}
{%- do columns.append(("D" ~ year ~ "_NPER_RP", "nb_personnes_rp_" ~ year)) -%}
{%- endfor -%}

{# Superficie #}
{%- do columns.append(("SUPERF", "superficie")) -%}

{# Naissances et décès inter-censitaires #}
{%- set nais_deces = [
    ('NAIS1621', 'naissances_2016_2021'),
    ('NAIS1115', 'naissances_2011_2015'),
    ('NAIS0610', 'naissances_2006_2010'),
    ('NAIS9905', 'naissances_1999_2005'),
    ('NAIS9099', 'naissances_1990_1999'),
    ('NAIS8290', 'naissances_1982_1990'),
    ('NAIS7582', 'naissances_1975_1982'),
    ('NAIS6875', 'naissances_1968_1975'),
    ('DECE1621', 'deces_2016_2021'),
    ('DECE1115', 'deces_2011_2015'),
    ('DECE0610', 'deces_2006_2010'),
    ('DECE9905', 'deces_1999_2005'),
    ('DECE9099', 'deces_1990_1999'),
    ('DECE8290', 'deces_1982_1990'),
    ('DECE7582', 'deces_1975_1982'),
    ('DECE6875', 'deces_1968_1975'),
] -%}

{%- for var_code, var_name in nais_deces -%}
{%- do columns.append((var_code, var_name)) -%}
{%- endfor -%}

{# Naissances et décès domiciliés annuels #}
{%- for year_num in range(14, 25) -%}
{%- do columns.append(("NAISD" ~ year_num, "naissances_domiciliees_20" ~ year_num)) -%}
{%- do columns.append(("DECESD" ~ year_num, "deces_domicilies_20" ~ year_num)) -%}
{%- endfor -%}

SELECT
    codgeo,
    {%- for src_var, dest_col in columns %}
    MAX(CASE WHEN variable = '{{ src_var }}' THEN value END) as {{ dest_col }}{{ "," if not loop.last }}
    {%- endfor %}
FROM {{ ref('dossier_complet') }}
GROUP BY codgeo
