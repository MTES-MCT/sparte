SELECT
    land_id,
    land_type,
    land_departement.departement,
    year,
    millesimes.index
FROM
    {{ ref('land_departement') }}
LEFT JOIN
    {{ ref('millesimes')}}
ON
    land_departement.departement = millesimes.departement
WHERE
    year is not null
