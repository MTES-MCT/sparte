
{% macro sum_percent_median_avg(field, total_field) %}
    sum({{ field }}) as {{ field }},
    (
        sum({{ field }}) * 100 / (
            {# Les valeurs à 0 sont remplacées par 1 pour éviter les divisions par 0 #}
            CASE
                WHEN sum({{ total_field }}) = 0 THEN 1
                ELSE sum({{ total_field }})
            END
        )
    ) as {{ field }}_percent,
    PERCENTILE_CONT(0.5) WITHIN GROUP(ORDER BY {{ field }}) as {{ field }}_median,
    PERCENTILE_CONT(0.5) WITHIN GROUP(ORDER BY {{ field }}_percent) as {{ field }}_median_percent,
    avg({{ field }}) as {{ field }}_avg
{% endmacro %}
