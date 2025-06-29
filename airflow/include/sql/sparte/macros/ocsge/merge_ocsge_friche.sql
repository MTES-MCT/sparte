{% macro merge_ocsge_friche(where_conditions) %}

with without_friche_surface as (
SELECT
    friche_site_id as site_id,
    array_agg(distinct year) as years,
    sum(percent) as percent,
    sum(surface) as surface,
    array_agg(distinct departement) as departements,
    index
FROM
    {{ ref('friche_couverture_et_usage')}}
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
    friche_site_id, index
)

SELECT
    without_friche_surface.site_id,
    without_friche_surface.years,
    without_friche_surface.percent,
    without_friche_surface.surface,
    friche.surface as friche_surface,
    without_friche_surface.departements,
    without_friche_surface.index
FROM
    without_friche_surface
LEFT JOIN
    {{ ref('friche') }}
    ON friche.site_id = without_friche_surface.site_id
{% endmacro %}
