{% macro boolean_as_oui_non(field, uppercase=false) %}
    CASE
        WHEN {{ field }} IS TRUE THEN '{{ 'oui' if not uppercase else 'OUI' }}'
        WHEN {{ field }} IS FALSE THEN '{{ 'non' if not uppercase else 'NON' }}'
        ELSE NULL
    END
{% endmacro %}
