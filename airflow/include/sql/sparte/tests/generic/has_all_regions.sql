{% test has_all_regions(model, column_name) %}

with validation_errors as (

    SELECT code from {{ ref('region') }}
    WHERE code NOT IN (
    select distinct {{ column_name }}
    from {{ model }}

    )
)

select * from validation_errors

{% endtest %}
