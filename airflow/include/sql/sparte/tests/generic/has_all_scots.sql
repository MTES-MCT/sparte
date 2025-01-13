{% test has_all_scots(model, column_name) %}

{{ config(severity = 'error') }}

with validation_errors as (

    SELECT id_scot from {{ ref('scot') }}
    WHERE id_scot NOT IN (
    select distinct {{ column_name }}
    from {{ model }}
    )
)

select * from validation_errors

{% endtest %}
