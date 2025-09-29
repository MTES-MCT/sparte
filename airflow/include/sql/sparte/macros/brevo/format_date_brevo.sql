{% macro format_date_brevo(date_field) %}
    -- format cible : JJ-MM-AAAA
    to_char({{ date_field }}, 'DD-MM-YYYY')
{% endmacro %}
