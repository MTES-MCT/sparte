import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import getCsrfToken from "@utils/csrf";
import { UseGetProjectQueryType } from "./types/project";
import { UseLandDetailType } from "./types/land";
import { ArtifZonageIndexType } from "./types/artif_zonage";
import { UseLandFrichesStatutType } from "./types/land_friches_statut";
import { UseLandFrichesType } from "./types/land_friches";
import { UseEnvTypes } from "./types/env";

export const djangoApi = createApi({
	reducerPath: "djangoApi",
	baseQuery: fetchBaseQuery({ credentials: "include" }),
	keepUnusedDataFor: 600,
	endpoints: (builder) => ({
		getProjectDownloadLinks: builder.query({
			query: (projectId) => ({
				url: `/project/${projectId}/telechargement-liens`,
				method: "GET",
			}),
		}),
		getLandConsoStats: builder.query({
			query: ({land_type, land_id, from_year, to_year}) => {
				return `/api/landconsostats/?${new URLSearchParams({
					land_type,
					land_id,
					from_year: from_year.toString(),
					to_year: to_year.toString()
				})}`
			},
		}),
		getLandPopStats: builder.query({
			query: ({land_type, land_id, from_year, to_year}) => {
				return `/api/landpopstats/?${new URLSearchParams({
					land_type,
					land_id,
					from_year: from_year.toString(),
					to_year: to_year.toString()
				})}`
			},
		}),
		getLandPopDensity: builder.query({
			query: ({land_type, land_id, year}) => {
				return `/api/landpopulationdensity/?${new URLSearchParams({
					land_type,
					land_id,
					year: year.toString()
				})}`
			},
		}),
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
		getLandImperStockIndex: builder.query({
			query: ({land_type, land_id, millesime_index}) => {
				return `/api/landimperstockindex/?${new URLSearchParams({
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
		getImperZonageIndex: builder.query({
			query: ({land_type, land_id, millesime_index}) => {
				return `/api/imperzonageindex/?${new URLSearchParams({
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
		getLandFriches: builder.query({
			query: ({land_type, land_id}) => {
				return `/api/landfriche/?${new URLSearchParams({
					land_type,
					land_id
				})}`
			},
		}),
		getSimilarTerritories: builder.query({
			query: ({land_type, land_id}) => {
				return `/api/nearestterritories/?${new URLSearchParams({
					land_type,
					land_id
				})}`
			},
		}),
		getSimilarTerritoriesByPopulation: builder.query({
			query: ({land_type, land_id}) => {
				return `/api/similarterritories/?${new URLSearchParams({
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
		getLandGeom: builder.query({
			query: ({ land_type, land_id }) => `/api/landsgeom/${land_type}/${land_id}`,
		}),
		getProject: builder.query({
			query: (id) => `/project/${id}/detail`,
			providesTags: (result, error, id) => [{ type: 'Project', id }],
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
		getLogementVacantAutorisationStats: builder.query({
			query: ({land_type, land_id, end_date}) => {
				const queryParams = new URLSearchParams({
					end_date: end_date.toString()
				})
				return `/api/logementvacantautorisationstats/${land_type}/${land_id}?${queryParams}`
			},
		}),
		recordDownloadRequest: builder.mutation<{ success: boolean }, { projectId: number; documentType: string }>({
			query: ({ projectId, documentType }) => ({
				url: `/project/${projectId}/downloadRequest/${documentType}`,
				method: 'GET'
			}),
		}),
		updateProjectTarget2031: builder.mutation<
			{ success: boolean; target_2031: number },
			{ projectId: number; target_2031: number }
		>({
			query: ({ projectId, target_2031 }) => {
				const csrfToken = getCsrfToken();
				return {
					url: `/api/project/${projectId}/target-2031/`,
					method: 'POST',
					body: { target_2031 },
					headers: csrfToken ? { 'X-CSRFToken': csrfToken } : {},
				};
			},
			// Invalider le cache du projet après la mise à jour
			invalidatesTags: (result, error, { projectId }) => [{ type: 'Project', id: projectId }],
		}),
		startExportPdf: builder.mutation<{ jobId: string }, { url: string; headerUrl: string; footerUrl: string }>({
			query: ({ url, headerUrl, footerUrl }) => {
				const csrfToken = getCsrfToken();
				return {
					url: '/project/export/start/',
					method: 'POST',
					body: { url, headerUrl, footerUrl },
					headers: csrfToken ? { 'X-CSRFToken': csrfToken } : {},
				};
			},
		}),
		getExportStatus: builder.query<{ status: string; error?: string } | Blob, { jobId: string; t: number }>({
			query: ({ jobId, t }) => ({
				url: `/project/export/status/${jobId}/?t=${t}`,
				responseHandler: async (response) => {
					const contentType = response.headers.get('content-type');
					if (contentType?.includes('application/pdf')) {
						return response.blob();
					}
					return response.json();
				},
			}),
		}),
	}),
	tagTypes: ['Project'],
});

const useGetProjectQuery: UseGetProjectQueryType = djangoApi.useGetProjectQuery;
const useGetLandQuery: UseLandDetailType = djangoApi.useGetLandQuery;
const useGetArtifZonageIndexQuery: ArtifZonageIndexType = djangoApi.useGetArtifZonageIndexQuery;
const useGetImperZonageIndexQuery = djangoApi.useGetImperZonageIndexQuery;
const useRecordDownloadRequestMutation = djangoApi.useRecordDownloadRequestMutation;
const useUpdateProjectTarget2031Mutation = djangoApi.useUpdateProjectTarget2031Mutation;
const useGetLandFrichesStatutQuery: UseLandFrichesStatutType = djangoApi.useGetLandFrichesStatutQuery;
const useGetLandFrichesQuery: UseLandFrichesType = djangoApi.useGetLandFrichesQuery;
const useGetProjectDownloadLinksQuery = djangoApi.useGetProjectDownloadLinksQuery;
const useGetEnvironmentQuery: UseEnvTypes = djangoApi.useGetEnvironmentQuery;
const useGetLandGeomQuery = djangoApi.useGetLandGeomQuery;
const useStartExportPdfMutation = djangoApi.useStartExportPdfMutation;
const useLazyGetExportStatusQuery = djangoApi.useLazyGetExportStatusQuery;

const {
	useGetDepartementListQuery,
	useSearchTerritoryQuery,
	useGetChartConfigQuery,
	useGetLandArtifStockIndexQuery,
	useGetLandImperStockIndexQuery,
	useGetLandConsoStatsQuery,
	useGetLandPopStatsQuery,
	useGetLandPopDensityQuery,
	useGetSimilarTerritoriesQuery,
	useGetSimilarTerritoriesByPopulationQuery,
	useGetLogementVacantAutorisationStatsQuery,
} = djangoApi;

export {
	useGetDepartementListQuery,
	useGetEnvironmentQuery,
	useSearchTerritoryQuery,
	useGetProjectQuery,
	useGetChartConfigQuery,
	useGetLandQuery,
	useGetArtifZonageIndexQuery,
	useGetImperZonageIndexQuery,
	useGetLandArtifStockIndexQuery,
	useGetLandImperStockIndexQuery,
	useGetLandConsoStatsQuery,
	useGetLandPopStatsQuery,
	useGetLandPopDensityQuery,
	useGetSimilarTerritoriesQuery,
	useGetSimilarTerritoriesByPopulationQuery,
	useRecordDownloadRequestMutation,
	useUpdateProjectTarget2031Mutation,
	useGetLandFrichesStatutQuery,
	useGetLandFrichesQuery,
	useGetProjectDownloadLinksQuery,
	useGetLandGeomQuery,
	useGetLogementVacantAutorisationStatsQuery,
	useStartExportPdfMutation,
	useLazyGetExportStatusQuery,
};
