{{ config(materialized='table', indexes=[{'columns': ['land_id', 'land_type'], 'type': 'btree'}]) }}

{%- set classement_names = ['total', 'non_classes', '1_etoile', '2_etoiles', '3_etoiles', '4_etoiles', '5_etoiles'] -%}

{%- set columns = [] -%}

{# Hôtels #}
{%- for c in classement_names -%}
{%- do columns.append('hotels_' ~ c) -%}
{%- endfor -%}
{%- for c in classement_names -%}
{%- do columns.append('hotels_chambres_' ~ c) -%}
{%- endfor -%}

{# Campings #}
{%- for prefix in ['campings_', 'campings_emplacements_', 'campings_emplacements_annee_', 'campings_emplacements_passage_'] -%}
{%- for c in classement_names -%}
{%- do columns.append(prefix ~ c) -%}
{%- endfor -%}
{%- endfor -%}

{# Autres hébergements #}
{%- for name in ['villages_vacances', 'villages_vacances_unites', 'villages_vacances_lits',
    'residences_tourisme', 'residences_tourisme_unites', 'residences_tourisme_lits',
    'auberges_jeunesse', 'auberges_jeunesse_unites', 'auberges_jeunesse_lits'] -%}
{%- do columns.append(name) -%}
{%- endfor -%}

{{ aggregate_dc_to_land('dc_tourisme', columns) }}
