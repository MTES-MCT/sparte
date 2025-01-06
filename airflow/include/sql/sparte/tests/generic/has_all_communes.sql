{% test has_all_communes(model, column_name) %}

{{ config(severity = 'error') }}


with validation_errors as (

    SELECT code from {{ ref('commune') }}
    WHERE code NOT IN (
    select distinct {{ column_name }}
    from {{ model }}

    )
)

select * from validation_errors

{% endtest %}
