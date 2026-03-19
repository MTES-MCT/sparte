{% macro _dc_agg_cols(sum_cols, avg_cols) %}
    {%- set ns = namespace(first=true) -%}
    {%- for col in sum_cols -%}
    {{ "," if not ns.first }}
    SUM({{ col }}) as {{ col }}
    {%- set ns.first = false -%}
    {%- endfor -%}
    {%- for col in avg_cols -%}
    {{ "," if not ns.first }}
    AVG({{ col }}) as {{ col }}
    {%- set ns.first = false -%}
    {%- endfor -%}
{% endmacro %}

{% macro aggregate_dc_to_land(source_model, columns, avg_columns=[]) %}

{%- set all_columns = columns + avg_columns -%}

{%- set paris = [
    '75101', '75102', '75103', '75104', '75105', '75106', '75107', '75108',
    '75109', '75110', '75111', '75112', '75113', '75114', '75115', '75116',
    '75117', '75118', '75119', '75120'
] -%}
{%- set lyon = [
    '69381', '69382', '69383', '69384', '69385', '69386', '69387', '69388', '69389'
] -%}
{%- set marseille = [
    '13201', '13202', '13203', '13204', '13205', '13206', '13207', '13208',
    '13209', '13210', '13211', '13212', '13213', '13214', '13215', '13216'
] -%}

WITH base AS (
    SELECT
        CASE
            WHEN dc.codgeo IN ('{{ paris | join("', '") }}') THEN '75056'
            WHEN dc.codgeo IN ('{{ lyon | join("', '") }}') THEN '69123'
            WHEN dc.codgeo IN ('{{ marseille | join("', '") }}') THEN '13055'
            ELSE dc.codgeo
        END as codgeo,
        commune.epci,
        commune.departement,
        commune.region,
        commune.scot,
        {%- for col in all_columns %}
        dc.{{ col }}{{ "," if not loop.last }}
        {%- endfor %}
    FROM {{ ref(source_model) }} as dc
    LEFT JOIN {{ ref('commune') }} as commune ON commune.code = dc.codgeo
)

-- Communes (avec arrondissements agrégés dans les communes parentes)
SELECT
    codgeo as land_id,
    '{{ var("COMMUNE") }}' as land_type,
    {{ _dc_agg_cols(columns, avg_columns) }}
FROM base
GROUP BY codgeo

UNION ALL

-- EPCI
SELECT
    epci as land_id,
    '{{ var("EPCI") }}' as land_type,
    {{ _dc_agg_cols(columns, avg_columns) }}
FROM base
WHERE epci IS NOT NULL
GROUP BY epci

UNION ALL

-- SCOT
SELECT
    scot as land_id,
    '{{ var("SCOT") }}' as land_type,
    {{ _dc_agg_cols(columns, avg_columns) }}
FROM base
WHERE scot IS NOT NULL
GROUP BY scot

UNION ALL

-- DEPARTEMENT
SELECT
    departement as land_id,
    '{{ var("DEPARTEMENT") }}' as land_type,
    {{ _dc_agg_cols(columns, avg_columns) }}
FROM base
WHERE departement IS NOT NULL
GROUP BY departement

UNION ALL

-- REGION
SELECT
    region as land_id,
    '{{ var("REGION") }}' as land_type,
    {{ _dc_agg_cols(columns, avg_columns) }}
FROM base
WHERE region IS NOT NULL
GROUP BY region

UNION ALL

-- CUSTOM
SELECT
    clc.custom_land_id as land_id,
    '{{ var("CUSTOM") }}' as land_type,
    {{ _dc_agg_cols(columns, avg_columns) }}
FROM base
INNER JOIN {{ ref('commune_custom_land') }} as clc ON clc.commune_code = base.codgeo
WHERE clc.custom_land_id IS NOT NULL
GROUP BY clc.custom_land_id

{% endmacro %}
