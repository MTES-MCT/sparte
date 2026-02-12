{% macro exclude_guyane_incomplete_lands(land_id_field, land_type_var) %}
NOT EXISTS (
    SELECT 1 FROM {{ ref("guyane_incomplete_lands") }} gil
    WHERE gil.land_id = {{ land_id_field }}
    AND gil.land_type = '{{ var(land_type_var) }}'
)
{% endmacro %}
