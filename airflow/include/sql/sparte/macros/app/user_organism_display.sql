{% macro user_organism_display(user_organism) %}
    CASE {{ user_organism }}
        WHEN 'COMMUNE' THEN 'Commune'
        WHEN 'EPCI' THEN 'EPCI'
        WHEN 'SCOT' THEN 'SCoT'
        WHEN 'SERVICES_REGIONAUX' THEN 'DREAL/DRIEAT/DRIHL'
        WHEN 'SERVICES_DEPARTEMENTAUX' THEN 'DDT/DDTM/DEAL'
        WHEN 'EXPERTS_URBANISTES' THEN 'Bureaux d''études/Agence d''urbanisme'
        WHEN 'ACTEURS_CITOYENS' THEN 'Association/Particulier'
    END
{% endmacro %}
