{% test has_surface(model, column_name, select_columns=none) %}

/*
    Flags geometries that are unusable as a territory: NULL, empty, or with a
    non-positive area. The NULL check comes first so ST_IsEmpty / ST_Area are
    never evaluated on a NULL geometry.

    `select_columns` controls what the failing rows expose (defaults to the
    tested column). Pass another column (e.g. an id) to make stored failures
    identifiable, or a comma-separated list for several columns.
*/

{% set output_columns = select_columns if select_columns is not none else column_name %}

with validation_errors as (

    select {{ output_columns }}
    from {{ model }}
    where {{ column_name }} is null
       or ST_IsEmpty({{ column_name }})
       or ST_Area({{ column_name }}) <= 0

)

select * from validation_errors

{% endtest %}
