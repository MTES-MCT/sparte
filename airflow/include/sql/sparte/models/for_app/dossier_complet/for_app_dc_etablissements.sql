{{ config(materialized='table', indexes=[{'columns': ['land_id', 'land_type'], 'type': 'btree'}]) }}

{%- set secteurs = ['az', 'be', 'fz', 'gu', 'oq'] -%}
{%- set tailles = ['0', '1', '10', '20', '50'] -%}

{%- set columns = ['etablissements_total'] -%}
{%- for s in secteurs -%}
{%- do columns.append('etablissements_' ~ s) -%}
{%- endfor -%}
{%- for t in tailles -%}
{%- do columns.append('etablissements_taille_' ~ t) -%}
{%- for s in secteurs -%}
{%- do columns.append('etablissements_' ~ s ~ '_taille_' ~ t) -%}
{%- endfor -%}
{%- endfor -%}

{%- do columns.append('effectifs_total') -%}
{%- for s in secteurs -%}
{%- do columns.append('effectifs_' ~ s) -%}
{%- endfor -%}
{%- for t in ['1', '10', '20', '50'] -%}
{%- do columns.append('effectifs_taille_' ~ t) -%}
{%- for s in secteurs -%}
{%- do columns.append('effectifs_' ~ s ~ '_taille_' ~ t) -%}
{%- endfor -%}
{%- endfor -%}
{%- do columns.append('effectifs_taille_100_plus') -%}
{%- for s in secteurs -%}
{%- do columns.append('effectifs_' ~ s ~ '_taille_100_plus') -%}
{%- endfor -%}

{%- for name in ['etablissements_sphere_presentielle', 'etablissements_sphere_productive',
    'etablissements_sphere_presentielle_public', 'etablissements_sphere_productive_public',
    'effectifs_sphere_presentielle', 'effectifs_sphere_productive',
    'effectifs_sphere_presentielle_public', 'effectifs_sphere_productive_public',
    'particuliers_employeurs_assistants_maternels', 'particuliers_employeurs_autres'] -%}
{%- do columns.append(name) -%}
{%- endfor -%}

{{ aggregate_dc_to_land('dc_etablissements', columns) }}
