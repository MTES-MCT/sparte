{% macro slugify(field) %}
    regexp_replace(
        regexp_replace(
            lower(unaccent({{ field }})),
            '[^a-z0-9]+', '-', 'g'
        ),
        '(^-+|-+$)', '', 'g'
    )
{% endmacro %}
