{% test is_valid_geom_warning(model, column_name) %}

{{ config(severity = 'warn') }}

with validation_errors as (

    select {{ column_name }}
    from {{ model }}
    where not ST_IsValid({{ column_name }})

)

select * from validation_errors

{% endtest %}
