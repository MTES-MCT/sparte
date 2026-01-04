import { TypedUseQuery } from "@reduxjs/toolkit/query/react";
import { BaseQueryFn, FetchArgs, FetchBaseQueryError } from "@reduxjs/toolkit/query";
import { OcsgeStatusEnum } from "../../components/features/status/OcsgeStatus";
import { ConsoCorrectionStatusEnum } from "../../components/features/status/ConsoCorrectionStatus";

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
    friche_sans_projet_surface_artif: number;
    friche_sans_projet_surface_imper: number;
    friche_avec_projet_surface: number;
    friche_avec_projet_surface_artif: number;
    friche_avec_projet_surface_imper: number;
    friche_reconvertie_surface: number;
    friche_reconvertie_surface_artif: number;
    friche_reconvertie_surface_imper: number;
    years_artif: number[];
    years_imper: number[];
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
    trajectoire_conso_is_territorialise: boolean;
}

export enum LandType {
    REGION = "REGION",
    DEPARTEMENT = "DEPART",
    SCOT = "SCOT",
    EPCI = "EPCI",
    COMMUNE = "COMM",
    NATION = "NATION",
}



export type TerritorialisationHierarchyItem = {
    land_id: string;
    land_type: string;
    land_name: string;
    objectif: number;
    parent_name: string | null;
    nom_document: string;
    document_url: string | null;
    document_comment: string;
    is_in_document: boolean;
    hierarchy?: TerritorialisationHierarchyItem[];
};

export type LandDetailResultType = {
    land_id: string;
    land_type: LandType;
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
    has_conso: boolean;
    has_friche: boolean;
    has_logements_vacants: boolean;
    territorialisation: {
        has_objectif: boolean;
        objectif: number | null;
        hierarchy: TerritorialisationHierarchyItem[];
        has_children: boolean;
        source_document: {
            land_name: string;
            nom_document: string;
        } | null;
        children_stats: {
            total_membres: number;
            en_depassement: number;
            en_bonne_voie: number;
            total_conso_since_2021: number;
            total_conso_max: number;
            progression_moyenne: number;
            progression_globale: number;
        } | null;
        is_from_parent: boolean;
        parent_land_name: string | null;
    };
    ocsge_status: OcsgeStatusEnum;
    friche_status: FricheStatusEnum;
    friche_status_details: FricheStatusDetails;
    logements_vacants_status: LogementVacantStatusEnum;
    logements_vacants_status_details: LogementsVacantsStatusDetails;
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