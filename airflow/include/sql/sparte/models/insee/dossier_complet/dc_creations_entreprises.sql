{{
    config(
        materialized='table',
        indexes=[{'columns': ['codgeo'], 'type': 'btree'}]
    )
}}

{# Créations d'entreprises et créations individuelles par an et par secteur #}

{%- set indicators = [] -%}

{# Créations totales par an #}
{%- for year_num in range(12, 25) -%}
{%- do indicators.append(('ENCTOT' ~ year_num, 'creations_entreprises_20' ~ year_num)) -%}
{%- endfor -%}

{# Créations individuelles par an #}
{%- for year_num in range(12, 25) -%}
{%- do indicators.append(('ENCITOT' ~ year_num, 'creations_individuelles_20' ~ year_num)) -%}
{%- endfor -%}

{# Créations par secteur (2024) #}
{%- set secteurs_24 = [
    ('BE', 'industrie'),
    ('FZ', 'construction'),
    ('GI', 'commerce_transports_hebergement'),
    ('JZ', 'information_communication'),
    ('KZ', 'finance_assurance'),
    ('LZ', 'immobilier'),
    ('MN', 'services_entreprises'),
    ('OQ', 'admin_enseignement_sante'),
    ('RU', 'autres_services'),
] -%}

{%- for code, name in secteurs_24 -%}
{%- do indicators.append(('ENC' ~ code ~ '24', 'creations_' ~ name)) -%}
{%- endfor -%}

{# Créations individuelles par secteur (2024) #}
{%- for code, name in secteurs_24 -%}
{%- do indicators.append(('ENCI' ~ code ~ '24', 'creations_individuelles_' ~ name)) -%}
{%- endfor -%}

SELECT
    codgeo,
    {%- for src_var, dest_col in indicators %}
    MAX(CASE WHEN variable = '{{ src_var }}' THEN value END) as {{ dest_col }}{{ "," if not loop.last }}
    {%- endfor %}
FROM {{ ref('dossier_complet') }}
GROUP BY codgeo
