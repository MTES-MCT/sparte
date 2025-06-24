import { TypedUseQuery } from "@reduxjs/toolkit/query/react";
import { BaseQueryFn, FetchArgs } from "@reduxjs/toolkit/query";
import { FetchBaseQueryError } from "@reduxjs/toolkit/dist/query/react";
import { OcsgeStatusEnum } from "@components/features/status/OcsgeStatus";
import { GeoJsonObject } from "geojson";

export type Millesime = {
    index: number;
    year: number;
    departement: string;
    departement_name?: string;
}
  
export type MillesimeByIndex = {
    index: number;
    years: string;
    departements: string;
}

export enum FricheStatusEnum {
    GISEMENT_NUL_ET_SANS_POTENTIEL = 'gisement nul et sans potentiel',
    GISEMENT_NUL_CAR_POTENTIEL_EXPLOITE = 'gisement nul car potentiel déjà exploité',
    GISEMENT_POTENTIEL_ET_NON_EXPLOITE = 'gisement potentiel et non exploité',
    GISEMENT_POTENTIEL_ET_EN_COURS_EXPLOITATION = 'gisement potentiel et en cours d’exploitation'
}

export type FricheStatusDetails = {
    friche_surface: number;
    friche_sans_projet_surface: number;
    friche_avec_projet_surface: number;
    friche_reconvertie_surface: number;
    friche_count: number;
    friche_sans_projet_count: number;
    friche_avec_projet_count: number;
    friche_reconvertie_count: number;
}
  
export type LandDetailResultType = {
    land_id: string;
    land_type: string;
    name: string;
    surface: number;
    surface_unit: string;
    surface_artif: number | null;
    percent_artif: number | null;
    years_artif: number[] | null;
    millesimes: Millesime[]
    millesimes_by_index: MillesimeByIndex[]
    child_land_types: string[];
    parent_keys: string[];
    departements: string[];
    is_interdepartemental: boolean;
    has_zonage: boolean;
    has_ocsge: boolean;
    ocsge_status: OcsgeStatusEnum;
    friche_status: FricheStatusEnum;
    friche_status_details: FricheStatusDetails;
	has_friche: boolean;
    simple_geom: GeoJsonObject;
    bounds: [number, number, number, number];
    max_bounds: [number, number, number, number];
};

type LandDetailQueryArg = string | FetchArgs | {
    land_id: string;
    land_type: string;
}

type LandDetailBaseQuery = BaseQueryFn<LandDetailQueryArg, unknown, FetchBaseQueryError>;
  
export type UseLandDetailType = TypedUseQuery<
    LandDetailResultType,
    LandDetailQueryArg,
    LandDetailBaseQuery
 >;  