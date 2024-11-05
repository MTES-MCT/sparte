{% test is_srid_4326(model, column_name) %}

with validation_errors as (

    select {{ column_name }}
    from {{ model }}
    where ST_SRID({{ column_name }}) != 4326

)

select * from validation_errors

{% endtest %}
