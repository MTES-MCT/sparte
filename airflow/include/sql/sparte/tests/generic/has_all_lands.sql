{% test has_all_lands(model, exceptions=[], excluded_land_types=[]) %}

select
    land.land_id,
    land.land_type
from {{ ref('land') }} as land
left join (
    select distinct land_id, land_type from {{ model }}
) as model
    on model.land_id = land.land_id
    and model.land_type = land.land_type
where model.land_id is null
{% if excluded_land_types %}
    and land.land_type not in (
        {% for lt in excluded_land_types %}
            '{{ lt }}'{% if not loop.last %},{% endif %}
        {% endfor %}
    )
{% endif %}
{% if exceptions %}
    and (land.land_id, land.land_type) not in (
        {% for e in exceptions %}
            ('{{ e.land_id }}', '{{ e.land_type }}'){% if not loop.last %},{% endif %}
        {% endfor %}
    )
{% endif %}

{% endtest %}
