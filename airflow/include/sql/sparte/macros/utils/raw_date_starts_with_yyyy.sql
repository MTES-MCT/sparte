
{% macro raw_date_starts_with_yyyy(raw_date_field) %}
    CASE
        WHEN {{ raw_date_field }} IS NULL THEN TRUE
        WHEN {{ raw_date_field }} = '' THEN TRUE
        WHEN CAST(SUBSTRING({{ raw_date_field }} FROM 1 FOR 4) AS INTEGER) > 1900 THEN TRUE
        ELSE FALSE
    END
{% endmacro %}
