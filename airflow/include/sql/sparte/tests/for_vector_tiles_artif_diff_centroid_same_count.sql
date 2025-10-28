/*
Ce test vérifie que la table for_vector_tiles_artif_difference_ocsge_centroid
contient le même nombre d'objets que la table for_vector_tiles_artif_difference_ocsge.

Puisque la table centroid ne fait que transformer les géométries en centroïdes,
elle doit contenir exactement le même nombre de lignes que la table source.

Le test retourne une ligne si les comptages diffèrent.
*/

with
    count_centroid as (
        select count(*) as nb_centroid
        from {{ ref("for_vector_tiles_artif_difference_ocsge_centroid") }}
    ),
    count_normal as (
        select count(*) as nb_normal
        from {{ ref("for_vector_tiles_artif_difference_ocsge") }}
    ),
    comparison as (
        select
            count_centroid.nb_centroid,
            count_normal.nb_normal,
            count_centroid.nb_centroid - count_normal.nb_normal as difference
        from count_centroid
        cross join count_normal
    )

select
    nb_centroid,
    nb_normal,
    difference
from comparison
where difference != 0
