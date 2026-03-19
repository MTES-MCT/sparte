{% macro land_type_to_slug(field) %}
    CASE {{ field }}
        WHEN '{{ var("COMMUNE") }}' THEN 'commune'
        WHEN '{{ var("EPCI") }}' THEN 'epci'
        WHEN '{{ var("DEPARTEMENT") }}' THEN 'departement'
        WHEN '{{ var("SCOT") }}' THEN 'scot'
        WHEN '{{ var("REGION") }}' THEN 'region'
        WHEN '{{ var("NATION") }}' THEN 'nation'
        ELSE lower({{ field }})
    END
{% endmacro %}
