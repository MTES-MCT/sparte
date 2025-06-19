{% macro standardize_friche_zonage_environnemental(friche_zonage_environnemental) %}
    CASE
        WHEN {{ friche_zonage_environnemental }} = 'proximite_zone (reserves_naturelles)' THEN 'proche d''une réserve naturelle'
        WHEN {{ friche_zonage_environnemental }} = 'reserve_naturelle' THEN 'réserve naturelle'
        WHEN {{ friche_zonage_environnemental }} = 'natura_2000' THEN 'Natura 2000'
        WHEN {{ friche_zonage_environnemental }} = 'hors zone' THEN 'hors zone'
        WHEN {{ friche_zonage_environnemental }} = 'znieff' THEN 'ZNIEFF'
        WHEN {{ friche_zonage_environnemental }} = 'proximite_zone (znieff)' THEN 'proche d''une ZNIEFF'
        WHEN {{ friche_zonage_environnemental }} = 'proximite_zone (natura_2000)' THEN 'proche d''une zone Natura 2000'
        ELSE {{ friche_zonage_environnemental }}
    END
{% endmacro %}
