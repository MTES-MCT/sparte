{{
    config(
        materialized='table',
    )
}}

{%- set years = range(2011, 2024) -%}
{%- set destinations = [
    ('total', ''),
    ('habitat', '_habitat'),
    ('activite', '_activite'),
    ('mixte', '_mixte'),
    ('route', '_route'),
    ('ferroviaire', '_ferroviaire'),
    ('inconnu', '_inconnu'),
] -%}

{%- set columns = [] -%}
{%- for year in years -%}
{%- for dest_name, dest_suffix in destinations -%}
{%- do columns.append('conso_' ~ year ~ dest_suffix) -%}
{%- endfor -%}
{%- endfor -%}

{%- set conso_columns = columns | join(', ') -%}

SELECT DISTINCT cc.commune_code as land_id, '{{ var("COMMUNE") }}' as land_type, cc.idcarreau, {{ conso_columns }}
FROM {{ ref('carroyage_lea_communes') }} cc

UNION ALL

SELECT DISTINCT cc.epci_code as land_id, '{{ var("EPCI") }}' as land_type, cc.idcarreau, {{ conso_columns }}
FROM {{ ref('carroyage_lea_communes') }} cc
WHERE cc.epci_code IS NOT NULL

UNION ALL

SELECT DISTINCT cc.departement_code as land_id, '{{ var("DEPARTEMENT") }}' as land_type, cc.idcarreau, {{ conso_columns }}
FROM {{ ref('carroyage_lea_communes') }} cc
WHERE cc.departement_code IS NOT NULL

UNION ALL

SELECT DISTINCT cc.region_code as land_id, '{{ var("REGION") }}' as land_type, cc.idcarreau, {{ conso_columns }}
FROM {{ ref('carroyage_lea_communes') }} cc
WHERE cc.region_code IS NOT NULL

UNION ALL

SELECT DISTINCT cc.scot_code as land_id, '{{ var("SCOT") }}' as land_type, cc.idcarreau, {{ conso_columns }}
FROM {{ ref('carroyage_lea_communes') }} cc
WHERE cc.scot_code IS NOT NULL

UNION ALL

SELECT DISTINCT ccl.custom_land_id as land_id, '{{ var("CUSTOM") }}' as land_type, cc.idcarreau, {{ conso_columns }}
FROM {{ ref('carroyage_lea_communes') }} cc
INNER JOIN {{ ref('commune_custom_land') }} as ccl
    ON ccl.commune_code = cc.commune_code
