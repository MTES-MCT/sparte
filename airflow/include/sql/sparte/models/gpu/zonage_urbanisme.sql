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
UNION ALL
SELECT * FROM {{ ref('zonage_urbanisme_martinique') }}
UNION ALL
SELECT * FROM {{ ref('zonage_urbanisme_guyane') }}
UNION ALL
SELECT * FROM {{ ref('zonage_urbanisme_reunion') }}
UNION ALL
SELECT * FROM {{ ref('zonage_urbanisme_metropole') }}
