import { createApi, fetchBaseQuery, TypedUseQuery } from "@reduxjs/toolkit/query/react";
import { FetchArgs, BaseQueryFn } from "@reduxjs/toolkit/query";
import { FetchBaseQueryError } from "@reduxjs/toolkit/dist/query/react";
import { GeoJsonObject } from "geojson";

import getCsrfToken from "@utils/csrf";
import { ConsoCorrectionStatusEnum } from "@components/widgets/ConsoCorrectionStatus";

type Logo = {
  src: string;
  alt: string;
  height: string;
  url?: string;
};

export type MenuItem = {
  label: string;
  url?: string;
  icon?: string;
  target?: string;
  subMenu?: MenuItem[];
  shouldDisplay?: boolean;
};

export type ProjectDetailResultType = {
  id: number;
  created_date: string;
  level_label: string;
  analyse_start_date: string;
  analyse_end_date: string;
  territory_name: string;
  has_zonage_urbanisme: boolean;
  consommation_correction_status: ConsoCorrectionStatusEnum;
  autorisation_logement_available: boolean;
  logements_vacants_available: boolean;
  land_id: string;
  land_type: string;
  departements: string[];
  bounds: [number, number, number, number];
  max_bounds: [number, number, number, number];
  centroid: {
    latitude: number;
    longitude: number;
  };
  emprise: GeoJsonObject;
  urls: {
    synthese: string;
    artificialisation: string;
    impermeabilisation: string;
    rapportLocal: string;
    trajectoires: string;
    consommation: string;
    logementVacant: string;
    update: string;
    dowloadConsoReport: string;
    downloadFullReport: string;
    dowloadLocalReport: string;
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

type ProjectDetailQueryArg = string | FetchArgs;
type ProjectDetailBaseQuery = BaseQueryFn<ProjectDetailQueryArg, unknown, FetchBaseQueryError>;
export type UseFetchingType = TypedUseQuery<ProjectDetailResultType, ProjectDetailQueryArg, ProjectDetailBaseQuery>;

export type Millesime = {
  index: number;
  year: number;
  departement: string;
}

export type MillesimeByIndex = {
  index: number;
  years: string;
  departements: string;
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
};

type LandDetailQueryArg = string | {
  land_type: string;
  land_id: string;
};
type LandDetailBaseQuery = BaseQueryFn<LandDetailQueryArg, unknown, FetchBaseQueryError>;

export type UseLandDetailType = TypedUseQuery<
  LandDetailResultType,
  LandDetailQueryArg,
  LandDetailBaseQuery
>;



export const djangoApi = createApi({
  reducerPath: "djangoApi",
  baseQuery: fetchBaseQuery({ credentials: "include" }),
  keepUnusedDataFor: 600,
  endpoints: (builder) => ({
    getChartConfig: builder.query({
      query: ({id, land_type, land_id, ...params}) => {
        const queryParams = new URLSearchParams(params)
        return `/api/chart/${id}/${land_type}/${land_id}?${queryParams}`
      },
      transformResponse: (response: any) => {
        delete response.responsive
        return response
      }
      
    }),
    getEnvironment: builder.query({
      query: () => "/env",
    }),
    getDepartementList: builder.query({
      query: () => "/public/departements/",
    }),
    getLand: builder.query({
      query: ({ land_type, land_id }) => `/api/lands/${land_type}/${land_id}`,
    }),
    getProject: builder.query({
      query: (id) => `/project/${id}/detail`,
    }),
    searchTerritory: builder.query({
      query: (needle) => {
        const csrfToken = getCsrfToken();
        return {
          url: "/public/search-land",
          method: "POST",
          body: { needle },
          headers: csrfToken ? { "X-CSRFToken": csrfToken } : {},
        };
      },
    }),
  }),
});

const useGetProjectQuery: UseFetchingType = djangoApi.useGetProjectQuery;
const useGetLandQuery: UseLandDetailType = djangoApi.useGetLandQuery;

const {
  useGetDepartementListQuery,
  useGetEnvironmentQuery,
  useSearchTerritoryQuery,
  useGetChartConfigQuery,
  useGetPageContentQuery,
} = djangoApi;

export {
  useGetDepartementListQuery,
  useGetEnvironmentQuery,
  useSearchTerritoryQuery,
  useGetProjectQuery,
  useGetChartConfigQuery,
  useGetLandQuery,
  useGetPageContentQuery,
};
