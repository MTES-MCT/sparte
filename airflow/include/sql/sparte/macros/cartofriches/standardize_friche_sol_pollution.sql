{#
    Certaines sources (EPFGE/AUDC notamment) renseignent la pollution du sol en
    oui / non, avec une casse et des espaces variables, au lieu du vocabulaire
    Cartofriches.
#}
{% macro standardize_friche_sol_pollution(sol_pollution) %}
    CASE lower(trim({{ sol_pollution }}))
        WHEN '' THEN 'inconnu'
        WHEN 'oui' THEN 'pollution avérée'
        WHEN 'non' THEN 'pollution inexistante'
        ELSE lower(trim({{ sol_pollution }}))
    END
{% endmacro %}
