
{% macro user_service_display(user_service) %}
    case {{ user_service }}
        when 'AMENAGEMENT_URBANISME_ET_PAYSAGE' then 'Aménagement Urbanisme et Paysage'
        when 'ETUDES_ET_EVALUATIONS' then 'Etudes et évaluations'
        when 'SECURITE_PREVENTION_ET_GESTION_DES_RISQUES' then 'Sécurité Prévention et Gestion des Risques'
        when 'ELABORATION_ET_PILOTAGE_DE_POLITIQUES_PUBLIQUES' then 'Elaboration et pilotage de politiques publiques'
        when 'RESSOURCES_NATURELLES_ET_BIODIVERSITE' then 'Ressources naturelles et biodiversité'
        when 'HABITAT_LOGEMENT' then 'Habitat Logement'
        when 'AUTRE' then 'Autre'
    end
{% endmacro %}
