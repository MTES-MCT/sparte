{{ config(materialized='table', indexes=[{'columns': ['land_id', 'land_type'], 'type': 'btree'}]) }}

{%- set columns = ['electeurs_2020', 'electeurs_2021', 'electeurs_2022', 'electeurs_2024'] -%}

{{ aggregate_dc_to_land('dc_electeurs', columns) }}
