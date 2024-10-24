{% macro make_valid_multipolygon(geom_field) %}
st_multi(
    st_collectionextract(
        st_makevalid( {{ geom_field}} ),
        3
    )
)
{% endmacro %}
