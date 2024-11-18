
{% macro sum_percent(field, total_field) %}
    sum({{ field }}) as {{ field }},
    ( -- prevents division by zero
        CASE
            WHEN    sum({{ total_field }}) = 0 THEN sum({{ field }}) * 100 / 1
            ELSE    sum({{ field }}) * 100 / sum({{ total_field }})
        END
    ) as {{ field }}_percent
{% endmacro %}
