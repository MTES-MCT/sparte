{{
    config(
        materialized='table',
        docs={'node_color': 'purple'}
    )
}}

{%- set min_year = 2011 -%}
{%- set max_year = 2023 -%}
{%- set years = range(min_year, max_year + 1) -%}
{%- set destinations = [
    ('total', ''),
    ('habitat', '_habitat'),
    ('activite', '_activite'),
    ('mixte', '_mixte'),
    ('route', '_route'),
    ('ferroviaire', '_ferroviaire'),
    ('inconnu', '_inconnu'),
] -%}

{%- set all_combos = [] -%}
{%- for start_year in years -%}
{%- for end_year in years -%}
{%- if end_year > start_year -%}
{%- for dest_name, dest_suffix in destinations -%}
{%- do all_combos.append((start_year, end_year, dest_name, dest_suffix)) -%}
{%- endfor -%}
{%- endif -%}
{%- endfor -%}
{%- endfor -%}

WITH base AS (
    SELECT * FROM {{ ref('carroyage_lea_land') }}
)

{% for start_year, end_year, dest_name, dest_suffix in all_combos -%}
{%- set terms = [] -%}
{%- for y in range(start_year, end_year + 1) -%}
{%- do terms.append('conso_' ~ y ~ dest_suffix) -%}
{%- endfor %}
, bounds_{{ start_year }}_{{ end_year }}_{{ dest_name }} AS (
    SELECT
        land_id,
        land_type,
        MIN({{ terms | join(' + ') }}) / 10000.0 as min_value,
        MAX({{ terms | join(' + ') }}) / 10000.0 as max_value
    FROM base
    GROUP BY land_id, land_type
)
{% endfor %}

{% for start_year, end_year, dest_name, dest_suffix in all_combos -%}
SELECT
    land_id,
    land_type,
    {{ start_year }} as start_year,
    {{ end_year }} as end_year,
    '{{ dest_name }}' as destination,
    min_value,
    max_value
FROM bounds_{{ start_year }}_{{ end_year }}_{{ dest_name }}
{{ "UNION ALL" if not loop.last }}
{% endfor %}
