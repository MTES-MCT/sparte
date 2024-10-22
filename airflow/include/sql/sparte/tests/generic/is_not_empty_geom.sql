{% test is_not_empty_geom(model, column_name) %}

with validation_errors as (

    select {{ column_name }}
    from {{ model }}
    where ST_IsEmpty({{ column_name }})

)

select * from validation_errors

{% endtest %}
