/*
    Une commune ne doit relever que d'un seul SCoT : son point intérieur
    (ST_PointOnSurface, toujours dans le polygone) ne doit tomber que dans un
    seul périmètre de gpu_scot.

    gpu_scot est censé le garantir : quand deux candidats revendiquent une même
    commune, le plus ancien est écarté en entier. Ce test vérifie que la
    résolution des conflits a bien fait son travail, en amont du DISTINCT ON de
    scot_communes qui masquerait un doublon en choisissant arbitrairement.

    Même croisement que scot_communes (gist sur gpu_scot.geom), mesuré à 10 s.
*/

with rattachements as (

    select
        commune.code as commune_code,
        commune.name as commune_nom,
        scot.id_scot,
        scot.nom_scot
    from {{ ref('commune_sans_scot') }} as commune
    inner join {{ ref('gpu_scot') }} as scot
        on ST_Intersects(scot.geom, ST_PointOnSurface(commune.geom_4326))

)

select
    commune_code,
    commune_nom,
    count(*) as nb_scot,
    string_agg(id_scot || ' ' || nom_scot, ' ; ' order by id_scot) as scots
from rattachements
group by commune_code, commune_nom
having count(*) > 1
order by commune_code
