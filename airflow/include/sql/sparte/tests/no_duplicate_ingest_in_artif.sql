/*
Ce test vérifie que pour chaque département, il y a un seul timestamp
de chargement par millésime de données d'artif.

*/

with timestamp_count as (
SELECT
    departement, year, count(distinct to_timestamp(to_char(loaded_date, 'YYYY-MM-DD HH24:MI'), 'YYYY-MM-DD HH24:MI')) as count_loaded_date
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
