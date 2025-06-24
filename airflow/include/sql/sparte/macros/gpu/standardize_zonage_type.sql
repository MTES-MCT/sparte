
{% macro standardize_zonage_type(zonage_type_field) %}
    CASE
        WHEN {{ zonage_type_field }} = 'Ah' THEN 'A'
        WHEN {{ zonage_type_field }} = 'Nh' THEN 'N'
        WHEN {{ zonage_type_field }} = 'Nd' THEN 'N'
        WHEN {{ zonage_type_field }} = 'AUs' THEN 'AU'
        WHEN {{ zonage_type_field }} = 'AUc' THEN 'AU'
        WHEN {{ zonage_type_field }} = '99' THEN null
        ELSE {{ zonage_type_field }}
    END
{% endmacro %}
