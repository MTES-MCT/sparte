{% macro extract_visited_page_from_url(url_field) %}

    (regexp_matches(
    {{ url_field}},
    '/tableau-de-bord/([a-z]+)'
    ))[1]::varchar
{% endmacro %}
