{% macro boolean_as_oui_non(field) %}
    CASE
        WHEN {{ field }} IS TRUE THEN 'oui'
        WHEN {{ field }} IS FALSE THEN 'non'
        ELSE NULL
    END
{% endmacro %}
