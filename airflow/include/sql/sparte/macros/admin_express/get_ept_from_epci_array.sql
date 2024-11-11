{% macro get_ept_from_epci_array(field_name) %}
    CASE
        WHEN {{ is_ept(field_name + '[1]') }} THEN {{ field_name }}[1]
        WHEN {{ is_ept(field_name + '[2]') }} THEN {{ field_name }}[2]
    ELSE
        NULL
    END
{% endmacro %}
