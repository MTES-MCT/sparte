{% macro standardize_friche_nature(friche_nature) %}
    CASE
        WHEN {{ friche_nature }} = 'MTE
' THEN 'MTE'
        ELSE {{ friche_nature }}
    END
{% endmacro %}
