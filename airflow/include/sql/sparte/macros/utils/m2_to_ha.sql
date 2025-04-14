{% macro m2_to_ha(field) %}
    CASE
        WHEN {{ field }} IS NULL THEN NULL
        ELSE {{ field }} / 10000
    END
{% endmacro %}
