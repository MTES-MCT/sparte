{{ config(materialized='table', indexes=[{'columns': ['land_id', 'land_type'], 'type': 'btree'}]) }}

{%- set avg_columns = [
    'salaire_net_moyen', 'salaire_net_moyen_femmes', 'salaire_net_moyen_hommes',
    'salaire_net_moyen_moins_25', 'salaire_net_moyen_25_39', 'salaire_net_moyen_40_49',
    'salaire_net_moyen_50_54', 'salaire_net_moyen_55_plus',
    'salaire_net_moyen_cadres', 'salaire_net_moyen_prof_intermediaires',
    'salaire_net_moyen_employes', 'salaire_net_moyen_ouvriers',
    'salaire_net_moyen_femmes_moins_25', 'salaire_net_moyen_femmes_25_39',
    'salaire_net_moyen_femmes_40_49', 'salaire_net_moyen_femmes_50_54', 'salaire_net_moyen_femmes_55_plus',
    'salaire_net_moyen_hommes_moins_25', 'salaire_net_moyen_hommes_25_39',
    'salaire_net_moyen_hommes_40_49', 'salaire_net_moyen_hommes_50_54', 'salaire_net_moyen_hommes_55_plus',
    'salaire_net_moyen_femmes_cadres', 'salaire_net_moyen_femmes_prof_intermediaires',
    'salaire_net_moyen_femmes_employes', 'salaire_net_moyen_femmes_ouvriers',
    'salaire_net_moyen_hommes_cadres', 'salaire_net_moyen_hommes_prof_intermediaires',
    'salaire_net_moyen_hommes_employes', 'salaire_net_moyen_hommes_ouvriers',
] -%}

{{ aggregate_dc_to_land('dc_salaires', [], avg_columns) }}
