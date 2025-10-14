SELECT
    site_id,
    /*
        the coalesce on the years below might fail if the site has
        no artif nor imper
     */
    COALESCE(artif_friche.surface_artif, 0) AS surface_artif,
    COALESCE(artif_friche.percent_artif, 0) AS percent_artif,
    COALESCE(artif_friche.years, imper_friche.years) AS years_artif,
    COALESCE(imper_friche.surface_imper, 0) AS surface_imper,
    COALESCE(imper_friche.percent_imper, 0) AS percent_imper,
    COALESCE(imper_friche.years, artif_friche.years) AS years_imper
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
LEFT JOIN LATERAL (
    SELECT
        surface as surface_imper,
        percent as percent_imper,
        years as years
    FROM
        {{ ref('imper_friche') }} as imper
    WHERE
        imper.site_id = friche.site_id
    ORDER BY index DESC
    LIMIT 1
) imper_friche ON true
WHERE
    artif_friche.surface_artif IS NOT NULL
