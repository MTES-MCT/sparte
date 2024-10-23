{% macro delete_from_this_where_field_not_in (
    this_field,
    table,
    that_field
) %}
    {% if not that_field %}
        {% set that_field = this_field %}
    {% endif %}
    DELETE FROM {{ this }}
    WHERE {{ this_field }} in (
        SELECT DISTINCT {{ this_field }} FROM {{ this }} AS foo
        LEFT JOIN {{ ref(table) }} AS bar
        ON foo.{{ this_field }} = bar.{{ that_field }}
        WHERE {{ that_field }} is null
    )
{% endmacro %}
