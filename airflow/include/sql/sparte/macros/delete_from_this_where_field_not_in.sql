{% macro delete_from_this_where_field_not_in (
    this_field,
    table,
    that_field
) %}
    {% if not that_field %}
        {% set that_field = this_field %}
    {% endif %}

    with that_source as (
		select
            distinct {{ that_field }} as field_to_check
        from
            {{ ref(table) }}
	)

	DELETE FROM {{ this }}
    WHERE {{ this_field }} not in (
		SELECT
            field_to_check
        from
            that_source
	)


{% endmacro %}
