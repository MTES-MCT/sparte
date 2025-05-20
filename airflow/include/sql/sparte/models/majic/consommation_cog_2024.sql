{{ config(materialized='table') }}

with unchanged as (
    select * from {{ ref('consommation') }}
    where commune_code not in (
        /* cog error */
        '60054',
        '85084',
        '76676',
        '52031',
        '14712',
        '52332',
        '52504',
        '55298'
    )
),
cog_error as (
    /* cog error divisions */
    {{ divide_majic('60054', '60054', 42.24) }}
    union
    {{ divide_majic('60054', '60694', 57.76) }}
    union
    {{ divide_majic('85084', '85165', 14.2) }}
    union
    {{ divide_majic('85084', '85212', 17.23) }}
    union
    {{ divide_majic('85084', '85084', 68.57) }}
    union
    {{ divide_majic('76676', '76601', 33.31) }}
    union
    {{ divide_majic('76676', '76676', 66.69) }}
    union
    {{ divide_majic('52031', '52278', 24.87) }}
    union
    {{ divide_majic('52031', '52031', 75.13) }}
    union
    {{ divide_majic('14712', '14666', 31.15) }}
    union
    {{ divide_majic('14712', '14712', 68.85) }}
    union
    {{ divide_majic('52332', '52465', 8.78) }}
    union
    {{ divide_majic('52332', '52033', 8.18) }}
    union
    {{ divide_majic('52332', '52332', 83.04) }}
    union
    {{ divide_majic('52504', '52124', 45.75) }}
    union
    {{ divide_majic('52504', '52504', 54.25) }}
    union
    {{ divide_majic('55298', '55138', 44.99) }}
    union
    {{ divide_majic('55298', '55298', 55.01) }}
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
    select *, 'COG_ERROR' as correction_status from cog_error
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
