{% macro secretisation_zlv() %}
    logements_parc_general > 11 AND
    logements_parc_prive > 11 AND
    logements_vacants_parc_general > 11 AND
    logements_vacants_2ans_parc_prive > 11
{% endmacro %}
