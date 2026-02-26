{{ config(materialized='table', indexes=[{'columns': ['land_id', 'land_type'], 'type': 'btree'}]) }}

{%- set sum_columns = [
    'nb_menages_fiscaux', 'nb_personnes_menages_fiscaux',
] -%}

{%- set avg_columns = [
    'mediane_niveau_vie', 'part_menages_imposes',
    'taux_pauvrete',
    'taux_pauvrete_moins_30', 'taux_pauvrete_30_39', 'taux_pauvrete_40_49',
    'taux_pauvrete_50_59', 'taux_pauvrete_60_74', 'taux_pauvrete_75_plus',
    'taux_pauvrete_proprietaires', 'taux_pauvrete_locataires',
    'part_revenus_activite', 'part_salaires', 'part_indemnites_chomage',
    'part_revenus_non_salaries', 'part_pensions_retraites', 'part_revenus_patrimoine',
    'part_prestations_sociales', 'part_prestations_familiales', 'part_minima_sociaux',
    'part_prestations_logement', 'part_impots',
    'decile_1', 'decile_9', 'rapport_interdecile',
] -%}

{{ aggregate_dc_to_land('dc_revenus_pauvrete', sum_columns, avg_columns) }}
