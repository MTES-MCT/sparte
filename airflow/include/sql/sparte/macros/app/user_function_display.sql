{% macro user_function_display(user_function) %}
    CASE {{ user_function }}
        WHEN 'RESPONSABLE_URBANISME' THEN 'Chargé(e) urbanisme'
        WHEN 'RESPONSABLE_PLANIFICATION' THEN 'Chargé(e) planification'
        WHEN 'RESPONSABLE_AMENAGEMENT' THEN 'Chargé(e) aménagement'
        WHEN 'SECRETAIRE_MAIRIE' THEN 'Secrétaire de mairie'
        WHEN 'ELU' THEN 'Élu(e)'
        WHEN 'AUTRE' THEN 'Autre'
    END
{% endmacro %}
