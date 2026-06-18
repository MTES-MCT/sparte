{{ config(materialized='table') }}


{% set start_year = 2011 %}
{% set end_year = 2025 %}

with unchanged as (
    select * from {{ ref('consommation') }}
    where commune_code not in (
        '09304',
        -- sources divisées
        '14712',
        '52031',
        '52332',
        '60054',
        '76676',
        '52504',
        '55298',
        -- communes filles déjà présentes dans MAJIC (remplacées par la division)
        '14666',
        '52278',
        '52033',
        '52465',
        '60694',
        '76601',
        '52124',
        '55138'
    )
),
divisions as (
    -- 14712 split into 14712 (kept) and 14666 (new). Percentages to adjust.
    {{ divide_majic('14712', '14666', percent=50, start_year=start_year, end_year=end_year) }}
    union
    {{ divide_majic('14712', '14712', percent=50, start_year=start_year, end_year=end_year) }}
    union
    -- 52031 split into 52031 (kept) and 52278 (new). Percentages to adjust.
    {{ divide_majic('52031', '52278', percent=50, start_year=start_year, end_year=end_year) }}
    union
    {{ divide_majic('52031', '52031', percent=50, start_year=start_year, end_year=end_year) }}
    union
    -- 52332 split into 52332 (kept), 52033 and 52465 (new). Percentages to adjust.
    {{ divide_majic('52332', '52033', percent=33.33, start_year=start_year, end_year=end_year) }}
    union
    {{ divide_majic('52332', '52465', percent=33.33, start_year=start_year, end_year=end_year) }}
    union
    {{ divide_majic('52332', '52332', percent=33.34, start_year=start_year, end_year=end_year) }}
    union
    -- 60054 split into 60054 (kept) and 60694 (new). Percentages to adjust.
    {{ divide_majic('60054', '60694', percent=50, start_year=start_year, end_year=end_year) }}
    union
    {{ divide_majic('60054', '60054', percent=50, start_year=start_year, end_year=end_year) }}
    union
    -- 76676 split into 76676 (kept) and 76601 (new). Percentages to adjust.
    {{ divide_majic('76676', '76601', percent=50, start_year=start_year, end_year=end_year) }}
    union
    {{ divide_majic('76676', '76676', percent=50, start_year=start_year, end_year=end_year) }}
    union
    -- 52504 split into 52504 (kept) and 52124 (new). Percentages to adjust.
    {{ divide_majic('52504', '52124', percent=50, start_year=start_year, end_year=end_year) }}
    union
    {{ divide_majic('52504', '52504', percent=50, start_year=start_year, end_year=end_year) }}
    union
    -- 55298 split into 55298 (kept) and 55138 (new). Percentages to adjust.
    {{ divide_majic('55298', '55138', percent=50, start_year=start_year, end_year=end_year) }}
    union
    {{ divide_majic('55298', '55298', percent=50, start_year=start_year, end_year=end_year) }}
),
missing_from_source as (
    {{ set_empty_data('09304', start_year=start_year, end_year=end_year) }}
    union
    {{ set_empty_data('29083', start_year=start_year, end_year=end_year) }}
    union
    {{ set_empty_data('29084', start_year=start_year, end_year=end_year) }}
    union
    {{ set_empty_data('97601', start_year=start_year, end_year=end_year) }}
    union
    {{ set_empty_data('97602', start_year=start_year, end_year=end_year) }}
    union
    {{ set_empty_data('97607', start_year=start_year, end_year=end_year) }}
    union
    {{ set_empty_data('97603', start_year=start_year, end_year=end_year) }}
    union
    {{ set_empty_data('97604', start_year=start_year, end_year=end_year) }}
    union
    {{ set_empty_data('97605', start_year=start_year, end_year=end_year) }}
    union
    {{ set_empty_data('97606', start_year=start_year, end_year=end_year) }}
    union
    {{ set_empty_data('97608', start_year=start_year, end_year=end_year) }}
    union
    {{ set_empty_data('97609', start_year=start_year, end_year=end_year) }}
    union
    {{ set_empty_data('97610', start_year=start_year, end_year=end_year) }}
    union
    {{ set_empty_data('97611', start_year=start_year, end_year=end_year) }}
    union
    {{ set_empty_data('97612', start_year=start_year, end_year=end_year) }}
    union
    {{ set_empty_data('97613', start_year=start_year, end_year=end_year) }}
    union
    {{ set_empty_data('97614', start_year=start_year, end_year=end_year) }}
    union
    {{ set_empty_data('97615', start_year=start_year, end_year=end_year) }}
    union
    {{ set_empty_data('97616', start_year=start_year, end_year=end_year) }}
    union
    {{ set_empty_data('97617', start_year=start_year, end_year=end_year) }}
),
together as (
    select *, 'UNCHANGED' as correction_status from unchanged
    union all
    select *, 'DIVISION' as correction_status from divisions
    union all
    select *, 'MISSING_FROM_SOURCE' as correction_status from missing_from_source
)
select
    *,
    (
        {%- for year in range(2011, 2022) %} conso_{{ year }} {% if not loop.last %} + {% endif %}{%- endfor %}
    ) as conso_2011_2021,
    (
        {%- for year in range(2011, 2022) %} conso_{{ year }}_inconnu {% if not loop.last %} + {% endif %}{%- endfor %}
    ) as conso_2011_2021_inconnu,
    (
        {%- for year in range(2011, 2022) %} conso_{{ year }}_ferroviaire {% if not loop.last %} + {% endif %}{%- endfor %}
    ) as conso_2011_2021_ferroviaire,
    (
        {%- for year in range(2011, 2022) %} conso_{{ year }}_route {% if not loop.last %} + {% endif %}{%- endfor %}
    ) as conso_2011_2021_route,
    (
        {%- for year in range(2011, 2022) %} conso_{{ year }}_mixte {% if not loop.last %} + {% endif %}{%- endfor %}
    ) as conso_2011_2021_mixte,
    (
        {%- for year in range(2011, 2022) %} conso_{{ year }}_activite {% if not loop.last %} + {% endif %}{%- endfor %}
    ) as conso_2011_2021_activite,
    (
        {%- for year in range(2011, 2022) %} conso_{{ year }}_habitat {% if not loop.last %} + {% endif %}{%- endfor %}
    ) as conso_2011_2021_habitat
from
    together
