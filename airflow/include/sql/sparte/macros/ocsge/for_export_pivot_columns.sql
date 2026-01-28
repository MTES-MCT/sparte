{% macro for_export_pivot_columns(indicateur, dimension, codes, has_trailing_columns=false) %}
{#
    Génère les colonnes pivot pour les exports artif/imper par couverture/usage.

    Args:
        indicateur: 'artif' ou 'imper'
        dimension: 'couverture' ou 'usage'
        codes: liste des codes à pivoter (ex: ['CS1.1.1.1', 'CS1.1.1.2'] ou usages)
        has_trailing_columns: true si des colonnes suivent après la boucle (pour gérer la virgule)
#}
{% for code in codes %}
{% set code_col = code | lower | replace('.', '_') %}
coalesce(max(CASE WHEN stock.index = 1 AND stock.{{ dimension }} = '{{ code }}' THEN stock.surface END), 0) as surface_{{ indicateur }}_1_{{ code_col }},
coalesce(max(CASE WHEN stock.index = 1 AND stock.{{ dimension }} = '{{ code }}' THEN stock.percent_of_indicateur END), 0) as pourcent_{{ indicateur }}_1_{{ code_col }},
coalesce(max(CASE WHEN stock.index = 2 AND stock.{{ dimension }} = '{{ code }}' THEN stock.surface END), 0) as surface_{{ indicateur }}_2_{{ code_col }},
coalesce(max(CASE WHEN stock.index = 2 AND stock.{{ dimension }} = '{{ code }}' THEN stock.percent_of_indicateur END), 0) as pourcent_{{ indicateur }}_2_{{ code_col }},
coalesce(max(CASE WHEN flux.{{ dimension }} = '{{ code }}' THEN flux.flux_{{ indicateur }} END), 0) as flux_{{ indicateur }}_{{ code_col }},
coalesce(max(CASE WHEN flux.{{ dimension }} = '{{ code }}' THEN flux.flux_des{{ indicateur }} END), 0) as flux_des{{ indicateur }}_{{ code_col }},
coalesce(max(CASE WHEN flux.{{ dimension }} = '{{ code }}' THEN flux.flux_{{ indicateur }}_net END), 0) as flux_{{ indicateur }}_net_{{ code_col }}{% if not loop.last or has_trailing_columns %},{% endif %}

{% endfor %}
{% endmacro %}
