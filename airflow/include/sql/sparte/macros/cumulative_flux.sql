{#

Cette macro permet de générer une liste de combinaisons d'années
pour calculer des flux cumulés.

Usage :
    {% call(start_year, end_year) cumulative_flux(
        first_available_year=2009,
        last_available_year=2012
    ) %}
        sum(population_{{ start_year }}_{{ end_year + 1 }})
        as population_{{ start_year }}_{{ end_year + 1 }}
    {% endcall %}

Va créer les colonnes suivantes :
    - population_2009_2010
    - population_2010_2011
    - population_2011_2012
    - population_2009_2011
    - population_2010_2012
    - population_2009_2012
A partir des sommes des colonnes de flux annuels.

#}
{% macro cumulative_flux(first_available_year, last_available_year) %}

    {% set ns = namespace(continued=false) %}
    {% for start_year in range(first_available_year, last_available_year + 1) %}
        {% for end_year in range(first_available_year, last_available_year + 1) -%}
            {% if start_year > end_year -%}
                {% set ns.continued = true %}
                {% continue %}
            {% else %}
                {% set ns.continued = false %}
            {% endif %}
            {{ caller(
                start_year=start_year,
                end_year=end_year,
            )}}
            {% if not loop.last and not ns.continued -%}, {% endif %}
        {% endfor %} {% if not loop.last and not ns.continued -%}, {% endif %}
    {% endfor %}
{% endmacro %}
