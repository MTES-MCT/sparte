
{% macro is_artificial(code_cs, code_us) %}
    (CASE
        -- CS 1.1
        WHEN {{ code_cs }} = 'CS1.1.1.1' THEN true
        WHEN {{ code_cs }} = 'CS1.1.1.2' THEN true
        WHEN {{ code_cs }} = 'CS1.1.2.1' AND {{ code_us }} != 'US1.3' THEN true
        WHEN {{ code_cs }} = 'CS1.1.2.2' THEN true

        -- CS 2.2
            -- CS 2.2.1
            WHEN {{ code_cs }} = 'CS2.2.1' AND {{ code_us }} = 'US2' THEN true
            WHEN {{ code_cs }} = 'CS2.2.1' AND {{ code_us }} = 'US3' THEN true
            WHEN {{ code_cs }} = 'CS2.2.1' AND {{ code_us }} = 'US5' THEN true
            WHEN {{ code_cs }} = 'CS2.2.1' AND {{ code_us }} = 'US235' THEN true
            WHEN {{ code_cs }} = 'CS2.2.1' AND {{ code_us }} = 'US4.1.1' THEN true
            WHEN {{ code_cs }} = 'CS2.2.1' AND {{ code_us }} = 'US4.1.2' THEN true
            WHEN {{ code_cs }} = 'CS2.2.1' AND {{ code_us }} = 'US4.1.3' THEN true
            WHEN {{ code_cs }} = 'CS2.2.1' AND {{ code_us }} = 'US4.1.4' THEN true
            WHEN {{ code_cs }} = 'CS2.2.1' AND {{ code_us }} = 'US4.1.5' THEN true
            WHEN {{ code_cs }} = 'CS2.2.1' AND {{ code_us }} = 'US4.2' THEN true
            WHEN {{ code_cs }} = 'CS2.2.1' AND {{ code_us }} = 'US4.3' THEN true
            WHEN {{ code_cs }} = 'CS2.2.1' AND {{ code_us }} = 'US6.1' THEN true
            WHEN {{ code_cs }} = 'CS2.2.1' AND {{ code_us }} = 'US6.2' THEN true

            -- CS 2.2.2
            WHEN {{ code_cs }} = 'CS2.2.2' AND {{ code_us }} = 'US2' THEN true
            WHEN {{ code_cs }} = 'CS2.2.2' AND {{ code_us }} = 'US3' THEN true
            WHEN {{ code_cs }} = 'CS2.2.2' AND {{ code_us }} = 'US5' THEN true
            WHEN {{ code_cs }} = 'CS2.2.2' AND {{ code_us }} = 'US235' THEN true
            WHEN {{ code_cs }} = 'CS2.2.2' AND {{ code_us }} = 'US4.1.1' THEN true
            WHEN {{ code_cs }} = 'CS2.2.2' AND {{ code_us }} = 'US4.1.2' THEN true
            WHEN {{ code_cs }} = 'CS2.2.2' AND {{ code_us }} = 'US4.1.3' THEN true
            WHEN {{ code_cs }} = 'CS2.2.2' AND {{ code_us }} = 'US4.1.4' THEN true
            WHEN {{ code_cs }} = 'CS2.2.2' AND {{ code_us }} = 'US4.1.5' THEN true
            WHEN {{ code_cs }} = 'CS2.2.2' AND {{ code_us }} = 'US4.2' THEN true
            WHEN {{ code_cs }} = 'CS2.2.2' AND {{ code_us }} = 'US4.3' THEN true
            WHEN {{ code_cs }} = 'CS2.2.2' AND {{ code_us }} = 'US6.1' THEN true
            WHEN {{ code_cs }} = 'CS2.2.2' AND {{ code_us }} = 'US6.2' THEN true
        ELSE false
    END)
{% endmacro %}
