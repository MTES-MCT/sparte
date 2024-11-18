{% macro divide_majic(initial_commune_code, final_commune_code, percent) %}
SELECT
        '{{ final_commune_code }}' as commune_code,
        conso_2009 * {{ percent }} / 100  as conso_2009,
        conso_2009_activite * {{ percent }} / 100  as conso_2009_activite,
        conso_2009_habitat * {{ percent }} / 100  as conso_2009_habitat,
        conso_2009_mixte * {{ percent }} / 100  as conso_2009_mixte,
        conso_2009_route * {{ percent }} / 100  as conso_2009_route,
        conso_2009_ferroviaire * {{ percent }} / 100  as conso_2009_ferroviaire,
        conso_2009_inconnu * {{ percent }} / 100  as conso_2009_inconnu,
        conso_2010 * {{ percent }} / 100  as conso_2010,
        conso_2010_activite * {{ percent }} / 100  as conso_2010_activite,
        conso_2010_habitat * {{ percent }} / 100  as conso_2010_habitat,
        conso_2010_mixte * {{ percent }} / 100  as conso_2010_mixte,
        conso_2010_route * {{ percent }} / 100  as conso_2010_route,
        conso_2010_ferroviaire * {{ percent }} / 100  as conso_2010_ferroviaire,
        conso_2010_inconnu * {{ percent }} / 100  as conso_2010_inconnu,
        conso_2011 * {{ percent }} / 100  as conso_2011,
        conso_2011_activite * {{ percent }} / 100  as conso_2011_activite,
        conso_2011_habitat * {{ percent }} / 100  as conso_2011_habitat,
        conso_2011_mixte * {{ percent }} / 100  as conso_2011_mixte,
        conso_2011_route * {{ percent }} / 100  as conso_2011_route,
        conso_2011_ferroviaire * {{ percent }} / 100  as conso_2011_ferroviaire,
        conso_2011_inconnu * {{ percent }} / 100  as conso_2011_inconnu,
        conso_2012 * {{ percent }} / 100  as conso_2012,
        conso_2012_activite * {{ percent }} / 100  as conso_2012_activite,
        conso_2012_habitat * {{ percent }} / 100  as conso_2012_habitat,
        conso_2012_mixte * {{ percent }} / 100  as conso_2012_mixte,
        conso_2012_route * {{ percent }} / 100  as conso_2012_route,
        conso_2012_ferroviaire * {{ percent }} / 100  as conso_2012_ferroviaire,
        conso_2012_inconnu * {{ percent }} / 100  as conso_2012_inconnu,
        conso_2013 * {{ percent }} / 100  as conso_2013,
        conso_2013_activite * {{ percent }} / 100  as conso_2013_activite,
        conso_2013_habitat * {{ percent }} / 100  as conso_2013_habitat,
        conso_2013_mixte * {{ percent }} / 100  as conso_2013_mixte,
        conso_2013_route * {{ percent }} / 100  as conso_2013_route,
        conso_2013_ferroviaire * {{ percent }} / 100  as conso_2013_ferroviaire,
        conso_2013_inconnu * {{ percent }} / 100  as conso_2013_inconnu,
        conso_2014 * {{ percent }} / 100  as conso_2014,
        conso_2014_activite * {{ percent }} / 100  as conso_2014_activite,
        conso_2014_habitat * {{ percent }} / 100  as conso_2014_habitat,
        conso_2014_mixte * {{ percent }} / 100  as conso_2014_mixte,
        conso_2014_route * {{ percent }} / 100  as conso_2014_route,
        conso_2014_ferroviaire * {{ percent }} / 100  as conso_2014_ferroviaire,
        conso_2014_inconnu * {{ percent }} / 100  as conso_2014_inconnu,
        conso_2015 * {{ percent }} / 100  as conso_2015,
        conso_2015_activite * {{ percent }} / 100  as conso_2015_activite,
        conso_2015_habitat * {{ percent }} / 100  as conso_2015_habitat,
        conso_2015_mixte * {{ percent }} / 100  as conso_2015_mixte,
        conso_2015_route * {{ percent }} / 100  as conso_2015_route,
        conso_2015_ferroviaire * {{ percent }} / 100  as conso_2015_ferroviaire,
        conso_2015_inconnu * {{ percent }} / 100  as conso_2015_inconnu,
        conso_2016 * {{ percent }} / 100  as conso_2016,
        conso_2016_activite * {{ percent }} / 100  as conso_2016_activite,
        conso_2016_habitat * {{ percent }} / 100  as conso_2016_habitat,
        conso_2016_mixte * {{ percent }} / 100  as conso_2016_mixte,
        conso_2016_route * {{ percent }} / 100  as conso_2016_route,
        conso_2016_ferroviaire * {{ percent }} / 100  as conso_2016_ferroviaire,
        conso_2016_inconnu * {{ percent }} / 100  as conso_2016_inconnu,
        conso_2017 * {{ percent }} / 100  as conso_2017,
        conso_2017_activite * {{ percent }} / 100  as conso_2017_activite,
        conso_2017_habitat * {{ percent }} / 100  as conso_2017_habitat,
        conso_2017_mixte * {{ percent }} / 100  as conso_2017_mixte,
        conso_2017_route * {{ percent }} / 100  as conso_2017_route,
        conso_2017_ferroviaire * {{ percent }} / 100  as conso_2017_ferroviaire,
        conso_2017_inconnu * {{ percent }} / 100  as conso_2017_inconnu,
        conso_2018 * {{ percent }} / 100  as conso_2018,
        conso_2018_activite * {{ percent }} / 100  as conso_2018_activite,
        conso_2018_habitat * {{ percent }} / 100  as conso_2018_habitat,
        conso_2018_mixte * {{ percent }} / 100  as conso_2018_mixte,
        conso_2018_route * {{ percent }} / 100  as conso_2018_route,
        conso_2018_ferroviaire * {{ percent }} / 100  as conso_2018_ferroviaire,
        conso_2018_inconnu * {{ percent }} / 100  as conso_2018_inconnu,
        conso_2019 * {{ percent }} / 100  as conso_2019,
        conso_2019_activite * {{ percent }} / 100  as conso_2019_activite,
        conso_2019_habitat * {{ percent }} / 100  as conso_2019_habitat,
        conso_2019_mixte * {{ percent }} / 100  as conso_2019_mixte,
        conso_2019_route * {{ percent }} / 100  as conso_2019_route,
        conso_2019_ferroviaire * {{ percent }} / 100  as conso_2019_ferroviaire,
        conso_2019_inconnu * {{ percent }} / 100  as conso_2019_inconnu,
        conso_2020 * {{ percent }} / 100  as conso_2020,
        conso_2020_activite * {{ percent }} / 100  as conso_2020_activite,
        conso_2020_habitat * {{ percent }} / 100  as conso_2020_habitat,
        conso_2020_mixte * {{ percent }} / 100  as conso_2020_mixte,
        conso_2020_route * {{ percent }} / 100  as conso_2020_route,
        conso_2020_ferroviaire * {{ percent }} / 100  as conso_2020_ferroviaire,
        conso_2020_inconnu * {{ percent }} / 100  as conso_2020_inconnu,
        conso_2021 * {{ percent }} / 100  as conso_2021,
        conso_2021_activite * {{ percent }} / 100  as conso_2021_activite,
        conso_2021_habitat * {{ percent }} / 100  as conso_2021_habitat,
        conso_2021_mixte * {{ percent }} / 100  as conso_2021_mixte,
        conso_2021_route * {{ percent }} / 100  as conso_2021_route,
        conso_2021_ferroviaire * {{ percent }} / 100  as conso_2021_ferroviaire,
        conso_2021_inconnu * {{ percent }} / 100  as conso_2021_inconnu,
        conso_2022 * {{ percent }} / 100  as conso_2022,
        conso_2022_activite * {{ percent }} / 100  as conso_2022_activite,
        conso_2022_habitat * {{ percent }} / 100  as conso_2022_habitat,
        conso_2022_mixte * {{ percent }} / 100  as conso_2022_mixte,
        conso_2022_route * {{ percent }} / 100  as conso_2022_route,
        conso_2022_ferroviaire * {{ percent }} / 100  as conso_2022_ferroviaire,
        conso_2022_inconnu * {{ percent }} / 100  as conso_2022_inconnu,
        conso_2009_2023 * {{ percent }} / 100  as conso_2009_2023,
        conso_2009_2023_activite * {{ percent }} / 100  as conso_2009_2023_activite,
        conso_2009_2023_habitat * {{ percent }} / 100  as conso_2009_2023_habitat,
        conso_2009_2023_mixte * {{ percent }} / 100  as conso_2009_2023_mixte,
        conso_2009_2023_route * {{ percent }} / 100  as conso_2009_2023_route,
        conso_2009_2023_ferroviaire * {{ percent }} / 100  as conso_2009_2023_ferroviaire,
        conso_2009_2023_inconnu * {{ percent }} / 100  as conso_2009_2023_inconnu
FROM
    {{ ref('consommation') }}
WHERE
    commune_code = '{{ initial_commune_code }}'
{% endmacro %}
