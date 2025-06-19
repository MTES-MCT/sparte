{% macro standardize_friche_type(friche_type) %}
    CASE
        WHEN {{ friche_type }} = 'friche cultuelle' THEN 'friche culturelle'
        ELSE {{ friche_type }}
    END
{% endmacro %}
