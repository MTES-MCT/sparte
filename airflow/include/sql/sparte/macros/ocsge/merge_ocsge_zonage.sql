{% macro merge_ocsge_zonage(where_conditions) %}
    with
        without_flux as materialized(
            with
                without_zonage_surface as (
                    select
                        zonage_checksum,
                        year,
                        sum(percent) as percent,
                        sum(surface) as surface,
                        index
                    from {{ ref('zonage_couverture_et_usage') }}
                    {% if where_conditions %}
                        where
                            {% for condition in where_conditions %}
                                {{ condition }} {% if not loop.last %} and {% endif %}
                            {% endfor %}
                        {% else %}
                        /* No where conditions */
                        {% endif %}
                    group by zonage_checksum, year, index
                )

            select
                without_zonage_surface.zonage_checksum,
                without_zonage_surface.year,
                without_zonage_surface.percent,
                without_zonage_surface.surface,
                zonage_urbanisme.surface as zonage_surface,
                without_zonage_surface.index
            from without_zonage_surface
            left join
                {{ ref('zonage_urbanisme') }}
                on zonage_urbanisme.checksum = without_zonage_surface.zonage_checksum

        )
    select
        without_flux.*,
        flux.flux_surface,
        flux.flux_percent,
        flux.flux_year as flux_previous_year
    from without_flux
    left join
        lateral(
            select
                without_flux.surface - previous_without_flux.surface as flux_surface,
                without_flux.percent - previous_without_flux.percent as flux_percent,
                year as flux_year
            from without_flux as previous_without_flux
            where
                previous_without_flux.zonage_checksum = without_flux.zonage_checksum
                and previous_without_flux.index = without_flux.index - 1
        ) as flux
        on true
    order by zonage_checksum, index

{% endmacro %}
