{% test same_geom(model, column_name, to, field, geom_column='geom', tolerance=0.03, accepted_differences=[]) %}

{{ config(severity = 'error') }}

/*
    Flags rows whose geometry is NOT similar enough to the source-of-truth model
    ({{ to }}), matched on {{ column_name }} = {{ field }}.

    Geometries are considered similar when the area of their symmetric difference
    stays below `tolerance` (= {{ tolerance }}) of the source-of-truth area. The
    ratio is unitless, so no SRID transform is needed; small discrepancies from
    precision or simplification are tolerated, real divergences are flagged.

    `accepted_differences` is a list of {{ column_name }} values whose geometries
    are manually considered identical regardless of the measured difference; they
    are never reported.
*/

with validation_errors as (

    select
        subject.{{ column_name }}
    from {{ model }} as subject
    inner join {{ to }} as source_of_truth
        on subject.{{ column_name }} = source_of_truth.{{ field }}
    where st_area(
        st_symdifference(subject.{{ geom_column }}, source_of_truth.{{ geom_column }})
    ) > {{ tolerance }} * st_area(source_of_truth.{{ geom_column }})
    {% if accepted_differences | length > 0 %}
    and subject.{{ column_name }} not in (
        {%- for value in accepted_differences -%}
        '{{ value }}'{% if not loop.last %}, {% endif %}
        {%- endfor -%}
    )
    {% endif %}

)

select * from validation_errors

{% endtest %}
