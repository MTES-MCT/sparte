{{ config(severity='warn', store_failures=true) }}

/*
    Deux zonages d'urbanisme ne sont pas censés se recouvrir : un point du
    territoire relève d'une zone et d'une seule. Quand deux zonages se chevauchent,
    tout objet OCS GE situé dans le recouvrement est compté dans les deux, et la
    somme des surfaces par commune dépasse la réalité.

    C'est un double comptage INDÉPENDANT de celui que corrige le découpage
    communal, et le découpage ne le règle pas : il se joue entre zonages, pas
    entre communes.

    SEVERITY WARN, volontairement. Le test échoue sur les données actuelles :
    9 013 paires et 435 ha en recouvrement sur le seul département 56. La cause
    dominante n'est pas une erreur de saisie mais un défaut de déduplication —
    7 670 des 9 013 paires opposent deux documents d'urbanisme distincts, et 8 253
    deux millésimes GPU différents. `4_zonage_urbanisme_deduplicated` ne retient
    qu'une ligne par géométrie IDENTIQUE (`partition by geom`), ce qui laisse
    passer les versions successives d'un même secteur dès que le tracé a bougé,
    ne serait-ce que d'un sommet.

    Le test est là pour mesurer et suivre le phénomène, pas pour bloquer la
    chaîne tant que la déduplication n'a pas été reprise.

    Partitionné par `commune_code` : deux zonages qui se recouvrent partagent
    forcément une commune, donc l'égalité sur index btree écarte l'essentiel des
    couples avant tout calcul spatial. Sans elle, l'auto-jointure porterait sur
    1,6 M de lignes. Mesuré à 11,8 s sur le 56, le département le plus chargé.

    Tolérance de 1 m² pour absorber les imprécisions de tracé entre documents.
*/

with paires as (

    select
        a.commune_code,
        a.departement,
        a.zonage_checksum as zonage_a,
        b.zonage_checksum as zonage_b,
        a.id_document_urbanisme as document_a,
        b.id_document_urbanisme as document_b,
        a.type_zone as type_a,
        b.type_zone as type_b,
        st_intersection(a.geom, b.geom) as recouvrement
    from {{ ref('zonage_urbanisme_commune') }} as a
    join {{ ref('zonage_urbanisme_commune') }} as b
        on a.commune_code = b.commune_code
       and a.part_id < b.part_id
       and a.geom && b.geom
       and st_intersects(a.geom, b.geom)
       and not st_touches(a.geom, b.geom)

)

select
    commune_code,
    departement,
    zonage_a,
    zonage_b,
    document_a,
    document_b,
    type_a,
    type_b,
    round(st_area(recouvrement)::numeric, 2) as recouvrement_m2
from paires
where st_area(recouvrement) > 1
