{{
    config(
        materialized='table',
        indexes=[{'columns': ['codgeo'], 'type': 'btree'}]
    )
}}

{# Tourisme : hôtels, campings, villages vacances, résidences de tourisme #}

{%- set classements = ['', '0', '1', '2', '3', '4', '5'] -%}
{%- set classement_names = {
    '': 'total',
    '0': 'non_classes',
    '1': '1_etoile',
    '2': '2_etoiles',
    '3': '3_etoiles',
    '4': '4_etoiles',
    '5': '5_etoiles',
} -%}

{%- set indicators = [] -%}

{# Hôtels : nombre et chambres #}
{%- for c in classements -%}
{%- do indicators.append(('HT' ~ c ~ '25', 'hotels_' ~ classement_names[c])) -%}
{%- endfor -%}
{%- for c in classements -%}
{%- do indicators.append(('HTCH' ~ c ~ '25', 'hotels_chambres_' ~ classement_names[c])) -%}
{%- endfor -%}

{# Campings : nombre, emplacements, loués à l'année, clientèle passage #}
{%- for c in classements -%}
{%- do indicators.append(('CPG' ~ c ~ '25', 'campings_' ~ classement_names[c])) -%}
{%- endfor -%}
{%- for c in classements -%}
{%- do indicators.append(('CPGE' ~ c ~ '25', 'campings_emplacements_' ~ classement_names[c])) -%}
{%- endfor -%}
{%- for c in classements -%}
{%- do indicators.append(('CPGEL' ~ c ~ '25', 'campings_emplacements_annee_' ~ classement_names[c])) -%}
{%- endfor -%}
{%- for c in classements -%}
{%- do indicators.append(('CPGEO' ~ c ~ '25', 'campings_emplacements_passage_' ~ classement_names[c])) -%}
{%- endfor -%}

{# Villages vacances #}
{%- set vv_indicators = [
    ('VV25', 'villages_vacances'),
    ('VVUH25', 'villages_vacances_unites'),
    ('VVLIT25', 'villages_vacances_lits'),
] -%}
{%- for var_code, var_name in vv_indicators -%}
{%- do indicators.append((var_code, var_name)) -%}
{%- endfor -%}

{# Résidences de tourisme #}
{%- set rt_indicators = [
    ('RT25', 'residences_tourisme'),
    ('RTUH25', 'residences_tourisme_unites'),
    ('RTLIT25', 'residences_tourisme_lits'),
] -%}
{%- for var_code, var_name in rt_indicators -%}
{%- do indicators.append((var_code, var_name)) -%}
{%- endfor -%}

{# Auberges de jeunesse / centres sportifs #}
{%- set aj_indicators = [
    ('AJCS25', 'auberges_jeunesse'),
    ('AJCSUH25', 'auberges_jeunesse_unites'),
    ('AJCSLIT25', 'auberges_jeunesse_lits'),
] -%}
{%- for var_code, var_name in aj_indicators -%}
{%- do indicators.append((var_code, var_name)) -%}
{%- endfor -%}

SELECT
    codgeo,
    {%- for src_var, dest_col in indicators %}
    MAX(CASE WHEN variable = '{{ src_var }}' THEN value END) as {{ dest_col }}{{ "," if not loop.last }}
    {%- endfor %}
FROM {{ ref('dossier_complet') }}
GROUP BY codgeo
