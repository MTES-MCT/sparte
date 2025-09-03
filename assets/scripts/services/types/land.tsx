import { TypedUseQuery } from "@reduxjs/toolkit/query/react";
import { BaseQueryFn, FetchArgs } from "@reduxjs/toolkit/query";
import { FetchBaseQueryError } from "@reduxjs/toolkit/dist/query/react";
import { OcsgeStatusEnum } from "@components/features/status/OcsgeStatus";
import { ConsoCorrectionStatusEnum } from "@components/features/status/ConsoCorrectionStatus";

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

export enum LogementVacantStatusEnum {
    GISEMENT_NUL = 'gisement nul',
    GISEMENT_POTENTIEL_DANS_LE_SOCIAL_ET_LE_PRIVE = 'gisement potentiel dans le social et le privé',
    GISEMENT_POTENTIEL_DANS_LE_SOCIAL = 'gisement potentiel dans le social',
    GISEMENT_POTENTIEL_DANS_LE_PRIVE = 'gisement potentiel dans le privé'
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

export type LogementsVacantsStatusDetails = {
    logements_parc_prive: number;
    logements_vacants_parc_prive: number;
    logements_parc_social: number;
    logements_vacants_parc_social: number;
    logements_parc_general: number;
    logements_vacants_parc_general: number;
    logements_vacants_parc_general_percent: number;
    logements_vacants_parc_prive_percent: number;
    logements_vacants_parc_social_percent: number;
    logements_vacants_parc_prive_on_parc_general_percent: number;
    logements_vacants_parc_social_on_parc_general_percent: number;
}

export type ConsoDetails = {
    conso_2011_2020: number;
    allowed_conso_raised_to_1ha_2021_2030: boolean;
    allowed_conso_2021_2030: number;
    conso_since_2021: number;
    annual_conso_since_2021: number;
    projected_conso_2030: number;
    currently_respecting_regulation: boolean;
    current_percent_use: number;
    respecting_regulation_by_2030: boolean;
    projected_percent_use_by_2030: number;
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
    logements_vacants_status: LogementVacantStatusEnum;
    logements_vacants_status_details: LogementsVacantsStatusDetails;
    has_logements_vacants: boolean;
	has_friche: boolean;
    bounds: [number, number, number, number];
    max_bounds: [number, number, number, number];
    conso_details: ConsoDetails;
    consommation_correction_status: ConsoCorrectionStatusEnum;
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