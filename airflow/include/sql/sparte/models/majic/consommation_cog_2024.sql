{{ config(materialized='table') }}

with unchanged as (
    select * from {{ ref('consommation') }}
    where commune_code not in (
        '08294',
        '08053',
        '16355',
        '16097',
        '18131',
        '18173',
        '25282',
        '25060',
        '25549',
        '25060',
        '35112',
        '35062',
        '49321',
        '49160',
        '64541',
        '64300',
        '69152',
        '69149',
        '85041',
        '85292',
        '85271',
        '86231',
        '86247',
        '95282',
        '95169',
        '85084',
        '85165',
        '85212',
        '60054',
        '60054',
        -- erreurs données source
        '14712',
        '14666',
        '52332',
        '52465',
        '52033',
        '52504',
        '52124',
        '52031',
        '52278',
        '55298',
        '55138',
        '76676',
        '76601'
    )
),
fusions as (
    {{ merge_majic('08053', ['08294']) }}
    union
    {{ merge_majic('16097', ['16355']) }}
    union
    {{ merge_majic('18173', ['18131']) }}
    union
    {{ merge_majic('25060', ['25282', '25549']) }}
    union
    {{ merge_majic('35062', ['35112']) }}
    union
    {{ merge_majic('49160', ['49321']) }}
    union
    {{ merge_majic('64300', ['64541']) }}
    union
    {{ merge_majic('69149', ['69152']) }}
    union
    {{ merge_majic('85292', ['85041', '85271']) }}
    union
    {{ merge_majic('86247', ['86231']) }}
    union
    {{ merge_majic('95169', ['95282']) }}
),
divisions as (
    {{ divide_majic('85084', '85084', 68.57) }}
    union
    {{ divide_majic('85084', '85165', 14.20) }}
    union
    {{ divide_majic('85084', '85212', 17.23) }}
    union
    {{ divide_majic('60054', '60054', 42.24) }}
    union
    {{ divide_majic('60054', '60694', 57.76) }}
),
cog_error as (
    {{ divide_majic('14712', '14712', 68.85) }}
    union
    {{ divide_majic('14712', '14666', 31.15) }}
    union
    {{ divide_majic('52332', '52465', 8.78) }}
    union
    {{ divide_majic('52332', '52033', 8.18) }}
    union
    {{ divide_majic('52332', '52332', 83.04) }}
    union
    {{ divide_majic('52504', '52504', 54.25) }}
    union
    {{ divide_majic('52504', '52124', 45.75) }}
    union
    {{ divide_majic('52031', '52031', 75.13) }}
    union
    {{ divide_majic('52031', '52278', 24.87) }}
    union
    {{ divide_majic('55298', '55298', 55.01) }}
    union
    {{ divide_majic('55298', '55138', 44.99) }}
    union
    {{ divide_majic('76676', '76676', 66.69) }}
    union
    {{ divide_majic('76676', '76601', 33.31) }}
),
missing_from_source as (
    {{ divide_majic('76676', '09304', 0) }}
    union
    {{ divide_majic('76676', '29083', 0) }}
    union
    {{ divide_majic('76676', '29084', 0) }}
),
together as (
    select *, 'UNCHANGED' as correction_status from unchanged
    union all
    select *, 'FUSION' as correction_status from fusions
    union all
    select *, 'DIVISION' as correction_status from divisions
    union all
    select *, 'COG_ERROR' as correction_status from cog_error
    union all
    select *, 'MISSING_FROM_SOURCE' as correction_status from missing_from_source
)
select
    commune_code,
    correction_status,
    {% set last_available_year = 2022 %}
    {% set first_available_year = 2009 %}
    {% set type_conso_suffixes = ["", "_activite", "_habitat"] %}
    {% set ns = namespace(continued=false) %}
    {% for type_conso_suffix in type_conso_suffixes %}
        {% for start_year in range(2009, last_available_year + 1) %}
            {% for end_year in range(2009, last_available_year + 1) -%}
                {% if start_year > end_year -%}
                    {% set ns.continued = true %}
                    {% continue %}
                {% else %}
                    {% set ns.continued = false %}
                {% endif %}
                (
                    {% for first_year in range(start_year, end_year + 1) -%}
                        {% set next_year = first_year + 1 -%}
                        conso_{{ first_year }}_{{ next_year }}{{ type_conso_suffix }}
                        {% if not loop.last -%} + {% endif %}
                    {% endfor %}
                ) as conso_{{ start_year }}_{{ end_year + 1 }}{{ type_conso_suffix }}
                {% if not loop.last and not ns.continued -%}, {% endif %}
            {% endfor %} {% if not loop.last and not ns.continued -%}, {% endif %}
        {% endfor %}
        {% if not loop.last -%}, {% endif %}
    {% endfor %}
from
    together
