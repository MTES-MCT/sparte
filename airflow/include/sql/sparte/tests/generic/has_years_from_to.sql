{% test has_years_from_to(model, column_name, from_year, to_year) %}

with years as (
    {% for year in range(from_year, to_year + 1) %}
    select {{ year }} as year
    {% if not loop.last %}
    union all
    {% endif %}
    {% endfor %}
), validation_errors as (
    SELECT year from years
    WHERE year NOT IN (
        select distinct {{ column_name }}
        from {{ model }}
    )

)

select * from validation_errors

{% endtest %}
