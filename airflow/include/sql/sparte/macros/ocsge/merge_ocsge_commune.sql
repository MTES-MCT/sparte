{% macro merge_ocsge_commune(where_conditions) %}

with without_commune_surface as (
SELECT
    commune_code as code,
    year,
    sum(percent) as percent,
    sum(surface) as surface,
    departement,
    index
FROM
    {{ ref('commune_couverture_et_usage')}}
    {% if where_conditions %}
    WHERE
        {% for condition in where_conditions %}
            {{ condition }}
            {% if not loop.last %} AND {% endif %}
        {% endfor %}
    {% else %}
    /* No where conditions */
    {% endif %}
group by
    commune_code, year, departement, index
)

SELECT
    without_commune_surface.code,
    without_commune_surface.year,
    without_commune_surface.percent,
    without_commune_surface.surface,
    commune.surface as land_surface,
    without_commune_surface.departement,
    without_commune_surface.index
FROM
    without_commune_surface
LEFT JOIN
    {{ ref('commune') }}
    ON commune.code = without_commune_surface.code


{% endmacro %}
