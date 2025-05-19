{% macro create_idx_if_not_exists(table, fields) %}
    CREATE INDEX IF NOT EXISTS idx_{{ table }}_{{ fields | join('_') }} ON {{ source('public', table) }} ({{ fields | join(', ') }});
{% endmacro %}
