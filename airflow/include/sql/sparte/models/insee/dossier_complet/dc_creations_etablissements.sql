{{
    config(
        materialized='table',
        indexes=[{'columns': ['codgeo'], 'type': 'btree'}]
    )
}}

{# Créations d'établissements par an et par secteur #}

{%- set secteurs = ['BE', 'FZ', 'GI', 'JZ', 'KZ', 'LZ', 'MN', 'OQ', 'RU'] -%}
{%- set secteur_names = {
    'BE': 'industrie',
    'FZ': 'construction',
    'GI': 'commerce_transports_hebergement',
    'JZ': 'information_communication',
    'KZ': 'finance_assurance',
    'LZ': 'immobilier',
    'MN': 'services_entreprises',
    'OQ': 'admin_enseignement_sante',
    'RU': 'autres_services',
} -%}

{%- set indicators = [] -%}

{%- for year_num in range(12, 25) -%}
{# Total #}
{%- do indicators.append(('ETCTOT' ~ year_num, 'creations_etablissements_20' ~ year_num)) -%}
{# Par secteur #}
{%- for s in secteurs -%}
{%- do indicators.append(('ETC' ~ s ~ year_num, 'creations_etablissements_' ~ secteur_names[s] ~ '_20' ~ year_num)) -%}
{%- endfor -%}
{%- endfor -%}

SELECT
    codgeo,
    {%- for src_var, dest_col in indicators %}
    MAX(CASE WHEN variable = '{{ src_var }}' THEN value END) as {{ dest_col }}{{ "," if not loop.last }}
    {%- endfor %}
FROM {{ ref('dossier_complet') }}
GROUP BY codgeo
