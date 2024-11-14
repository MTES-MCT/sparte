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
