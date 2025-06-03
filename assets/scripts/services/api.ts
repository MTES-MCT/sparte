import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import getCsrfToken from "@utils/csrf";
import { UseGetProjectQueryType } from "./types/project";
import { UseLandDetailType } from "./types/land";
import { ArtifZonageIndexType } from "./types/artif_zonage";
import { UseLandFrichesStatutType } from "./types/land_friches_statut";

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
				// les options highchart de responsive ne fonctionne pas 
				// avec highchart react
				delete response.responsive
				return response
			}
		}),
		getLandArtifStockIndex: builder.query({
			query: ({land_type, land_id, millesime_index}) => {
				return `/api/landartifstockindex/?${new URLSearchParams({
					land_type,
					land_id,
					millesime_index
				})}`
			},
		}),
		getArtifZonageIndex: builder.query({
			query: ({land_type, land_id, millesime_index}) => {
				return `/api/artifzonageindex/?${new URLSearchParams({
					land_type,
					land_id,
					millesime_index
				})}`
			},
		}),
		getLandFrichesStatut: builder.query({
			query: ({land_type, land_id}) => {
				return `/api/landfrichestatut/?${new URLSearchParams({
					land_type,
					land_id
				})}`
			},
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
		downloadDiagnostic: builder.mutation<{ message: string }, { projectId: number; documentType: string }>({
			query: ({ projectId, documentType }) => ({
				url: `/project/${projectId}/telechargement/${documentType}`,
				method: 'GET'
			}),
		}),
	}),
});

const useGetProjectQuery: UseGetProjectQueryType = djangoApi.useGetProjectQuery;
const useGetLandQuery: UseLandDetailType = djangoApi.useGetLandQuery;
const useGetArtifZonageIndexQuery: ArtifZonageIndexType = djangoApi.useGetArtifZonageIndexQuery;
const useDownloadDiagnosticMutation = djangoApi.useDownloadDiagnosticMutation;
const useGetLandFrichesStatutQuery: UseLandFrichesStatutType = djangoApi.useGetLandFrichesStatutQuery;

const {
	useGetDepartementListQuery,
	useGetEnvironmentQuery,
	useSearchTerritoryQuery,
	useGetChartConfigQuery,
	useGetLandArtifStockIndexQuery,
} = djangoApi;

export {
	useGetDepartementListQuery,
	useGetEnvironmentQuery,
	useSearchTerritoryQuery,
	useGetProjectQuery,
	useGetChartConfigQuery,
	useGetLandQuery,
	useGetArtifZonageIndexQuery,
	useGetLandArtifStockIndexQuery,
	useDownloadDiagnosticMutation,
	useGetLandFrichesStatutQuery,
};
