SELECT
    site_id,
    artif_friche.surface_artif AS surface_artif,
    artif_friche.percent_artif AS percent_artif,
    artif_friche.years AS years_artif
FROM
    {{ ref('friche') }}
LEFT JOIN LATERAL (
    SELECT
    artif.surface as surface_artif,
    artif.percent as percent_artif,
    artif.years as years
    FROM
        {{ ref('artif_friche')}} as artif
    WHERE
    artif.site_id = friche.site_id
    ORDER by index DESC
    LIMIT 1
) artif_friche ON true
WHERE
    artif_friche.surface_artif IS NOT NULL
