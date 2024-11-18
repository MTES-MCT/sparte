{{ config(materialized='table') }}

{% for to_year in range(2010, 2023) %}
    {% for from_year in range(2009, to_year) %}
        {% if from_year >= to_year %}
            {% break %}
        {% endif %}
        SELECT
            commune_code,
            {{ from_year }} as from_year,
            {{ to_year }} as to_year,
            max(commune.surface) as commune_surface,
            {{ sum_percent('total', 'commune.surface') }},
            {{ sum_percent('activite', 'commune.surface') }},
            {{ sum_percent('habitat', 'commune.surface') }},
            {{ sum_percent('mixte', 'commune.surface') }},
            {{ sum_percent('route', 'commune.surface') }},
            {{ sum_percent('ferroviaire', 'commune.surface') }},
            {{ sum_percent('inconnu', 'commune.surface') }}

        FROM {{ ref('consommation_en_lignes') }} as conso
        LEFT JOIN
            {{ ref('commune') }} as commune
        ON commune.code = conso.commune_code
        WHERE year BETWEEN {{ from_year }} AND {{ to_year }}
        GROUP BY
            commune_code,
            from_year,
            to_year
        {% if not loop.last %}
            UNION
        {% endif %}
    {% endfor %}
            {% if not loop.last %}
            UNION
        {% endif %}
{% endfor %}
