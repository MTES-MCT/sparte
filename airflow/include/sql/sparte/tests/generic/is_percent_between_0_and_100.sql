{% test is_percent_between_0_and_100(model, column_name) %}

with validation_errors as (

    select {{ column_name }}
    from {{ model }}
    where {{ column_name }} < 0 or {{ column_name }} > 100

)

select * from validation_errors

{% endtest %}
