export type SourceType =
    | "geojson"
    | "vector"
    | "raster";

export interface BaseSourceOptions {
    id: string;
    type: SourceType;
    attribution?: string;
    minzoom?: number;
    maxzoom?: number;
}

/**
 * Emplacement des données servies depuis le bucket Airflow, tel que renvoyé par
 * l'endpoint Django `/env`. Injecté dans chaque source à sa création : ces URL
 * dépendent de l'environnement et doivent rester alignées sur la liste
 * d'autorisation CSP, elles ne peuvent donc pas être figées dans le bundle.
 */
export interface MapDataLocations {
    vector_tiles_location: string;
    geojson_location: string;
}
