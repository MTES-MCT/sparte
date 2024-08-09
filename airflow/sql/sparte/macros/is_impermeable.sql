
{% macro is_impermeable(code_cs) %}
    (CASE
        WHEN {{ code_cs }} = 'CS1.1.1.1' THEN true
        WHEN {{ code_cs }} = 'CS1.1.1.2' THEN true
        ELSE false
    END)
{% endmacro %}
