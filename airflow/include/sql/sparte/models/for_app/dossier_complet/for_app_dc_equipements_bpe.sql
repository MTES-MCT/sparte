{{ config(materialized='table', indexes=[{'columns': ['land_id', 'land_type'], 'type': 'btree'}]) }}

{%- set columns = [
    'coiffure', 'hypermarche', 'supermarche', 'superette', 'epicerie', 'boulangerie',
    'station_service', 'borne_recharge_electrique',
    'ecole_maternelle', 'ecole_primaire', 'ecole_elementaire', 'college',
    'lycee_general_technologique', 'lycee_professionnel', 'lycee_agricole',
    'enseignement_gen_tech_lycee_pro', 'enseignement_pro_lycee_gen_tech',
    'medecin_generaliste', 'chirurgien_dentiste', 'masseur_kinesitherapeute',
    'infirmier', 'psychologue',
] -%}

{{ aggregate_dc_to_land('dc_equipements_bpe', columns) }}
