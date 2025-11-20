import { TypedUseQuery } from "@reduxjs/toolkit/query/react";
import { FetchArgs, BaseQueryFn, FetchBaseQueryError } from "@reduxjs/toolkit/query";

export type Logo = {
	src: string;
	alt: string;
	height: string;
	url?: string;
};

export type SubMenuItem = {
    label: string;
    url?: string;
	new?: boolean;
};

export type MenuItem = {
    label: string;
    url?: string;
    icon?: string;
    target?: string;
    subMenu?: SubMenuItem[];
    shouldDisplay?: boolean;
    new?: boolean;
    soon?: boolean;
};

export type ProjectDetailResultType = {
    id: number;
    created_date: string;
    level_label: string;
    analyse_start_date: string;
    analyse_end_date: string;
    territory_name: string;
    has_zonage_urbanisme: boolean;
    autorisation_logement_available: boolean;
    logements_vacants_available: boolean;
    land_id: string;
    land_type: string;
    departements: string[];
    bounds: [number, number, number, number];
    max_bounds: [number, number, number, number];
    target_2031: number | null;
    centroid: {
		latitude: number;
		longitude: number;
    };
    urls: {
		synthese: string;
		artificialisation: string;
		friches: string;
		impermeabilisation: string;
		rapportLocal: string;
		trajectoires: string;
		consommation: string;
		logementVacant: string;
		update: string;
		dowloadConsoReport: string;
		downloadFullReport: string;
		dowloadLocalReport: string;
		downloads: string;
    };
    navbar: {
    	menuItems: MenuItem[];
    };
    footer: {
      	menuItems: MenuItem[];
    };
    header: {
		logos: Logo[];
		search: {
			createUrl: string;
		};
      	menuItems: MenuItem[];
    };
};
  
type ProjectDetailQueryArg = string | FetchArgs
type ProjectDetailBaseQuery = BaseQueryFn<ProjectDetailQueryArg, unknown, FetchBaseQueryError>;
export type UseGetProjectQueryType = TypedUseQuery<ProjectDetailResultType, ProjectDetailQueryArg, ProjectDetailBaseQuery>;
