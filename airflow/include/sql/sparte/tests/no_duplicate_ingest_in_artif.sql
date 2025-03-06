/*
Ce test vérifie que pour chaque département, il y a un seul timestamp
de chargement par millésime de données d'occupation du sol.

*/

with timestamp_count as (
SELECT
    departement, year, count(distinct loaded_date) as count_loaded_date
from
    {{ ref('artif') }}
GROUP BY departement, year
)
SELECT
    departement, year
FROM
    timestamp_count
WHERE
    count_loaded_date != 1
