{% macro common_friche_for_app_fields() %}
    friche_count,
    friche_sans_projet_count,
    friche_avec_projet_count,
    friche_reconvertie_count,
    friche_surface / 10000 as friche_surface,
    friche_sans_projet_surface / 10000 as friche_sans_projet_surface,
    friche_avec_projet_surface / 10000 as friche_avec_projet_surface,
    friche_reconvertie_surface / 10000 as friche_reconvertie_surface
{% endmacro %}
