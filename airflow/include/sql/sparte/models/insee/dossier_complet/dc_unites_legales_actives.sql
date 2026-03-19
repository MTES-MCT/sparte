{{
    config(
        materialized='table',
        indexes=[{'columns': ['codgeo'], 'type': 'btree'}]
    )
}}

{# Unités légales et établissements actifs par secteur #}

{%- set secteurs = [
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

{%- set indicators = [] -%}

{# Unités légales #}
{%- do indicators.append(('ENNTOT23', 'unites_legales_total')) -%}
{%- for code, name in secteurs -%}
{%- do indicators.append(('ENN' ~ code ~ '23', 'unites_legales_' ~ name)) -%}
{%- endfor -%}

{# Établissements actifs #}
{%- do indicators.append(('ETNTOT23', 'etablissements_actifs_total')) -%}
{%- for code, name in secteurs -%}
{%- do indicators.append(('ETN' ~ code ~ '23', 'etablissements_actifs_' ~ name)) -%}
{%- endfor -%}

SELECT
    codgeo,
    {%- for src_var, dest_col in indicators %}
    MAX(CASE WHEN variable = '{{ src_var }}' THEN value END) as {{ dest_col }}{{ "," if not loop.last }}
    {%- endfor %}
FROM {{ ref('dossier_complet') }}
GROUP BY codgeo
