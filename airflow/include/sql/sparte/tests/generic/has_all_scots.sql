{% test has_all_scots(model, column_name) %}

with validation_errors as (

    SELECT id_scot from {{ ref('scot') }}
    WHERE id_scot NOT IN (
    select {{ column_name }}
    from {{ model }}
    )
)

select * from validation_errors

{% endtest %}
