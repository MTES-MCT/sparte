/*
    Chaque région d'outre-mer a son placement sur la carte nationale. Une région absente ici
    resterait à sa position réelle dans les tuiles de communes, à des milliers de kilomètres
    de la vue.

    Avec les tests `unique` et `accepted_values` du modèle, ce test garantit exactement une
    ligne par région de la macro national_map_drom_regions.
*/

SELECT expected.region_code
FROM (
    VALUES
    {% for region_code in national_map_drom_regions() -%}
    ('{{ region_code }}'){{ "," if not loop.last }}
    {% endfor -%}
) AS expected (region_code)
LEFT JOIN {{ ref('national_map_drom_placement') }} AS placement
    ON placement.region_code = expected.region_code
WHERE placement.region_code IS NULL
