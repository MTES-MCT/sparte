{% macro delete_from_this_where_field_not_in (
    this_field,
    table,
    that_field
) %}
    {% if not that_field %}
        {% set that_field = this_field %}
    {% endif %}
    DELETE FROM {{ this }} WHERE {{ this_field }} not in (SELECT DISTINCT {{ that_field }} FROM {{ ref(table) }} )
{% endmacro %}
