SELECT
    (SELECT SUM(reltuples)::bigint FROM pg_class WHERE relkind = 'r') as nombre_objets,
    (SELECT COUNT(*) FROM pg_tables WHERE schemaname = 'public') as nombre_source_données,
    87.0 as couverture_test_donnees_produites
