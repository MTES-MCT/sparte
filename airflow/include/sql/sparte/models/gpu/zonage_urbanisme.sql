{{
    config(
        materialized='table',
        indexes=[
            {'columns': ['geom'], 'type': 'gist'},
            {'columns': ['libelle'], 'type': 'btree'},
            {'columns': ['type_zone'], 'type': 'btree'},
            {'columns': ['checksum'], 'type': 'btree'},
            {'columns': ['srid_source'], 'type': 'btree'}
        ])
}}

SELECT * FROM {{ ref('zonage_urbanisme_guadeloupe') }}
UNION
SELECT * FROM {{ ref('zonage_urbanisme_martinique') }}
UNION
SELECT * FROM {{ ref('zonage_urbanisme_guyane') }}
UNION
SELECT * FROM {{ ref('zonage_urbanisme_reunion') }}
UNION
SELECT * FROM {{ ref('zonage_urbanisme_metropole') }}
