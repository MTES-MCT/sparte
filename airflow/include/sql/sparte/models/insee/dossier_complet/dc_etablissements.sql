{{
    config(
        materialized='table',
        indexes=[{'columns': ['codgeo'], 'type': 'btree'}]
    )
}}

{# Établissements : stock par secteur, taille, sphère économique #}

{%- set secteurs = ['AZ', 'BE', 'FZ', 'GU', 'OQ'] -%}
{%- set tailles = ['0', '1', '10', '20', '50'] -%}

{%- set indicators = [] -%}

{# Total et par secteur #}
{%- do indicators.append(('ETTOT23', 'etablissements_total')) -%}
{%- for s in secteurs -%}
{%- do indicators.append(('ET' ~ s ~ '23', 'etablissements_' ~ s | lower)) -%}
{%- endfor -%}

{# Par taille x secteur #}
{%- for t in tailles -%}
{%- do indicators.append(('ETTEF' ~ t ~ '23', 'etablissements_taille_' ~ t)) -%}
{%- for s in secteurs -%}
{%- do indicators.append(('ET' ~ s ~ t ~ '23', 'etablissements_' ~ s | lower ~ '_taille_' ~ t)) -%}
{%- endfor -%}
{%- endfor -%}

{# Effectifs total et par secteur #}
{%- do indicators.append(('ETPTOT23', 'effectifs_total')) -%}
{%- for s in secteurs -%}
{%- do indicators.append(('ETP' ~ s ~ '23', 'effectifs_' ~ s | lower)) -%}
{%- endfor -%}

{# Effectifs par taille x secteur #}
{%- for t in ['1', '10', '20', '50'] -%}
{%- do indicators.append(('ETPTEF' ~ t ~ '23', 'effectifs_taille_' ~ t)) -%}
{%- for s in secteurs -%}
{%- do indicators.append(('ETP' ~ s ~ t ~ '23', 'effectifs_' ~ s | lower ~ '_taille_' ~ t)) -%}
{%- endfor -%}
{%- endfor -%}

{# Effectifs 100+ (CP) #}
{%- do indicators.append(('ETPTEFCP23', 'effectifs_taille_100_plus')) -%}
{%- for s in secteurs -%}
{%- do indicators.append(('ETP' ~ s ~ 'CP23', 'effectifs_' ~ s | lower ~ '_taille_100_plus')) -%}
{%- endfor -%}

{# Sphère économique #}
{%- set sphere_indicators = [
    ('ETPRES23', 'etablissements_sphere_presentielle'),
    ('ETNPRES23', 'etablissements_sphere_productive'),
    ('ETPRESPUB23', 'etablissements_sphere_presentielle_public'),
    ('ETNPRESPUB23', 'etablissements_sphere_productive_public'),
    ('ETPPRES23', 'effectifs_sphere_presentielle'),
    ('ETPNPRES23', 'effectifs_sphere_productive'),
    ('ETPPRESPUB23', 'effectifs_sphere_presentielle_public'),
    ('ETPNPRESPUB23', 'effectifs_sphere_productive_public'),
    ('ETASSMAT23', 'particuliers_employeurs_assistants_maternels'),
    ('ETAUTRES23', 'particuliers_employeurs_autres'),
] -%}

{%- for var_code, var_name in sphere_indicators -%}
{%- do indicators.append((var_code, var_name)) -%}
{%- endfor -%}

SELECT
    codgeo,
    {%- for src_var, dest_col in indicators %}
    MAX(CASE WHEN variable = '{{ src_var }}' THEN value END) as {{ dest_col }}{{ "," if not loop.last }}
    {%- endfor %}
FROM {{ ref('dossier_complet') }}
GROUP BY codgeo
