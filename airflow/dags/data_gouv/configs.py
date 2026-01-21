configs = [
    {
        "dataset_slug": "ocsge-coverage",
        "dataset_title": "Part du territoire Francais couvert par OCS GE",
        "frequency": "@weekly",
        "resources": [
            {
                "format": "csv",
                "filename": "part_territoire_francais_couvert_par_ocsge.csv",
                "sql": "SELECT * FROM public_for_export.ocsge_surface_cover_percent",
                "resource_slug": "ocsge-coverage-csv",
                "resource_title": "part_territoire_francais_couvert_par_ocsge.csv",
            },
        ],
    },
    {
        "dataset_slug": "trajectoires-zan-2031",
        "dataset_title": "Etat des lieux national de la trajectoire de consommation d'espaces NAF (naturels, agricoles et forestiers) à horizon 2031",  # noqa: E501
        "frequency": "@once",
        "resources": [
            {
                "format": "csv",
                "filename": "trajectoires_communes.csv",
                "sql": "SELECT * FROM public_for_export.trajectoires_communes",
                "resource_slug": "trajectoires-communes-csv",
                "resource_title": "trajectoires_communes.csv",
            },
        ],
    },
    # === ARTIFICIALISATION ===
    {
        "dataset_slug": "artificialisation-collectivites",
        "dataset_title": "Artificialisation des collectivites de France",
        "resources": [
            # Commune
            {
                "format": "csv",
                "filename": "artif_commune.csv",
                "sql": "SELECT * FROM public_for_export.for_export_artif_commune",
                "resource_slug": "artif-commune-csv",
                "resource_title": "Artificialisation par commune (CSV)",
            },
            {
                "format": "gpkg",
                "filename": "artif_commune.gpkg",
                "sql_to_layer_name_mapping": {
                    "artif_commune": "SELECT * FROM public_for_export.for_export_artif_commune"
                },
                "resource_slug": "artif-commune-gpkg",
                "resource_title": "Artificialisation par commune (GeoPackage)",
            },
            # EPCI
            {
                "format": "csv",
                "filename": "artif_epci.csv",
                "sql": "SELECT * FROM public_for_export.for_export_artif_epci",
                "resource_slug": "artif-epci-csv",
                "resource_title": "Artificialisation par EPCI (CSV)",
            },
            {
                "format": "gpkg",
                "filename": "artif_epci.gpkg",
                "sql_to_layer_name_mapping": {"artif_epci": "SELECT * FROM public_for_export.for_export_artif_epci"},
                "resource_slug": "artif-epci-gpkg",
                "resource_title": "Artificialisation par EPCI (GeoPackage)",
            },
            # SCOT
            {
                "format": "csv",
                "filename": "artif_scot.csv",
                "sql": "SELECT * FROM public_for_export.for_export_artif_scot",
                "resource_slug": "artif-scot-csv",
                "resource_title": "Artificialisation par SCOT (CSV)",
            },
            {
                "format": "gpkg",
                "filename": "artif_scot.gpkg",
                "sql_to_layer_name_mapping": {"artif_scot": "SELECT * FROM public_for_export.for_export_artif_scot"},
                "resource_slug": "artif-scot-gpkg",
                "resource_title": "Artificialisation par SCOT (GeoPackage)",
            },
            # Departement
            {
                "format": "csv",
                "filename": "artif_departement.csv",
                "sql": "SELECT * FROM public_for_export.for_export_artif_departement",
                "resource_slug": "artif-departement-csv",
                "resource_title": "Artificialisation par departement (CSV)",
            },
            {
                "format": "gpkg",
                "filename": "artif_departement.gpkg",
                "sql_to_layer_name_mapping": {
                    "artif_departement": "SELECT * FROM public_for_export.for_export_artif_departement"
                },
                "resource_slug": "artif-departement-gpkg",
                "resource_title": "Artificialisation par departement (GeoPackage)",
            },
            # Region
            {
                "format": "csv",
                "filename": "artif_region.csv",
                "sql": "SELECT * FROM public_for_export.for_export_artif_region",
                "resource_slug": "artif-region-csv",
                "resource_title": "Artificialisation par region (CSV)",
            },
            {
                "format": "gpkg",
                "filename": "artif_region.gpkg",
                "sql_to_layer_name_mapping": {
                    "artif_region": "SELECT * FROM public_for_export.for_export_artif_region"
                },
                "resource_slug": "artif-region-gpkg",
                "resource_title": "Artificialisation par region (GeoPackage)",
            },
        ],
    },
    # === IMPERMEABILISATION ===
    {
        "dataset_slug": "impermeabilisation-collectivites",
        "dataset_title": "Impermeabilisation des collectivites de France",
        "resources": [
            # Commune
            {
                "format": "csv",
                "filename": "imper_commune.csv",
                "sql": "SELECT * FROM public_for_export.for_export_imper_commune",
                "resource_slug": "imper-commune-csv",
                "resource_title": "Impermeabilisation par commune (CSV)",
            },
            {
                "format": "gpkg",
                "filename": "imper_commune.gpkg",
                "sql_to_layer_name_mapping": {
                    "imper_commune": "SELECT * FROM public_for_export.for_export_imper_commune"
                },
                "resource_slug": "imper-commune-gpkg",
                "resource_title": "Impermeabilisation par commune (GeoPackage)",
            },
            # EPCI
            {
                "format": "csv",
                "filename": "imper_epci.csv",
                "sql": "SELECT * FROM public_for_export.for_export_imper_epci",
                "resource_slug": "imper-epci-csv",
                "resource_title": "Impermeabilisation par EPCI (CSV)",
            },
            {
                "format": "gpkg",
                "filename": "imper_epci.gpkg",
                "sql_to_layer_name_mapping": {"imper_epci": "SELECT * FROM public_for_export.for_export_imper_epci"},
                "resource_slug": "imper-epci-gpkg",
                "resource_title": "Impermeabilisation par EPCI (GeoPackage)",
            },
            # SCOT
            {
                "format": "csv",
                "filename": "imper_scot.csv",
                "sql": "SELECT * FROM public_for_export.for_export_imper_scot",
                "resource_slug": "imper-scot-csv",
                "resource_title": "Impermeabilisation par SCOT (CSV)",
            },
            {
                "format": "gpkg",
                "filename": "imper_scot.gpkg",
                "sql_to_layer_name_mapping": {"imper_scot": "SELECT * FROM public_for_export.for_export_imper_scot"},
                "resource_slug": "imper-scot-gpkg",
                "resource_title": "Impermeabilisation par SCOT (GeoPackage)",
            },
            # Departement
            {
                "format": "csv",
                "filename": "imper_departement.csv",
                "sql": "SELECT * FROM public_for_export.for_export_imper_departement",
                "resource_slug": "imper-departement-csv",
                "resource_title": "Impermeabilisation par departement (CSV)",
            },
            {
                "format": "gpkg",
                "filename": "imper_departement.gpkg",
                "sql_to_layer_name_mapping": {
                    "imper_departement": "SELECT * FROM public_for_export.for_export_imper_departement"
                },
                "resource_slug": "imper-departement-gpkg",
                "resource_title": "Impermeabilisation par departement (GeoPackage)",
            },
            # Region
            {
                "format": "csv",
                "filename": "imper_region.csv",
                "sql": "SELECT * FROM public_for_export.for_export_imper_region",
                "resource_slug": "imper-region-csv",
                "resource_title": "Impermeabilisation par region (CSV)",
            },
            {
                "format": "gpkg",
                "filename": "imper_region.gpkg",
                "sql_to_layer_name_mapping": {
                    "imper_region": "SELECT * FROM public_for_export.for_export_imper_region"
                },
                "resource_slug": "imper-region-gpkg",
                "resource_title": "Impermeabilisation par region (GeoPackage)",
            },
        ],
    },
]
