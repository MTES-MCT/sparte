import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import getCsrfToken from "@utils/csrf";
import { UseGetProjectQueryType } from "./types/project";
import { UseLandDetailType } from "./types/land";
import { ArtifZonageIndexType } from "./types/artif_zonage";
import { UseLandFrichesStatutType } from "./types/land_friches_statut";
import { UseLandFrichesType } from "./types/land_friches";
import { UseEnvTypes } from "./types/env";
import {
	ReportDraft,
	ReportDraftListItem,
	CreateReportDraftPayload,
	UpdateReportDraftPayload,
	ReportTypeOption,
} from "./types/reportDraft";

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
			query: ({ land_type, land_id, from_year, to_year }) => {
				return `/api/landconsostats/?${new URLSearchParams({
					land_type,
					land_id,
					from_year: from_year.toString(),
					to_year: to_year.toString()
				})}`
			},
		}),
		getLandPopStats: builder.query({
			query: ({ land_type, land_id, from_year, to_year }) => {
				return `/api/landpopstats/?${new URLSearchParams({
					land_type,
					land_id,
					from_year: from_year.toString(),
					to_year: to_year.toString()
				})}`
			},
		}),
		getLandPopDensity: builder.query({
			query: ({ land_type, land_id, year }) => {
				return `/api/landpopulationdensity/?${new URLSearchParams({
					land_type,
					land_id,
					year: year.toString()
				})}`
			},
		}),
		getChartConfig: builder.query({
			query: ({ id, land_type, land_id, ...params }) => {
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
			query: ({ land_type, land_id, millesime_index }) => {
				return `/api/landartifstockindex/?${new URLSearchParams({
					land_type,
					land_id,
					millesime_index
				})}`
			},
		}),
		getLandImperStockIndex: builder.query({
			query: ({ land_type, land_id, millesime_index }) => {
				return `/api/landimperstockindex/?${new URLSearchParams({
					land_type,
					land_id,
					millesime_index
				})}`
			},
		}),
		getArtifZonageIndex: builder.query({
			query: ({ land_type, land_id, millesime_index }) => {
				return `/api/artifzonageindex/?${new URLSearchParams({
					land_type,
					land_id,
					millesime_index
				})}`
			},
		}),
		getImperZonageIndex: builder.query({
			query: ({ land_type, land_id, millesime_index }) => {
				return `/api/imperzonageindex/?${new URLSearchParams({
					land_type,
					land_id,
					millesime_index
				})}`
			},
		}),
		getLandFrichesStatut: builder.query({
			query: ({ land_type, land_id }) => {
				return `/api/landfrichestatut/?${new URLSearchParams({
					land_type,
					land_id
				})}`
			},
		}),
		getLandFriches: builder.query({
			query: ({ land_type, land_id }) => {
				return `/api/landfriche/?${new URLSearchParams({
					land_type,
					land_id
				})}`
			},
		}),
		getSimilarTerritories: builder.query({
			query: ({ land_type, land_id }) => {
				return `/api/nearestterritories/?${new URLSearchParams({
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
			query: ({ land_type, land_id, end_date }) => {
				const queryParams = new URLSearchParams({
					end_date: end_date.toString()
				})
				return `/api/logementvacantautorisationstats/${land_type}/${land_id}?${queryParams}`
			},
		}),
		recordDownloadRequest: builder.mutation<{ success: boolean }, { projectId: number; documentType: string; draftId?: string }>({
			query: ({ projectId, documentType, draftId }) => {
				let url = `/project/${projectId}/downloadRequest/${documentType}`;
				if (draftId) {
					url += `?draft_id=${draftId}`;
				}
				return { url, method: 'GET' };
			},
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
			invalidatesTags: (result, error, { projectId }) => [{ type: 'Project', id: String(projectId) }],
		}),
		updateProjectComparisonLands: builder.mutation<
			{ success: boolean; comparison_lands: Array<{ land_type: string; land_id: string; name: string }> },
			{ projectId: number; comparison_lands: Array<{ land_type: string; land_id: string; name: string }> }
		>({
			query: ({ projectId, comparison_lands }) => {
				const csrfToken = getCsrfToken();
				return {
					url: `/api/project/${projectId}/comparison-lands/`,
					method: 'POST',
					body: { comparison_lands },
					headers: csrfToken ? { 'X-CSRFToken': csrfToken } : {},
				};
			},
			invalidatesTags: (result, error, { projectId }) => [{ type: 'Project', id: String(projectId) }],
		}),
		startExportPdf: builder.mutation<{ jobId: string }, { land_type: string; land_id: string; report_type: string }>({
			query: ({ land_type, land_id, report_type }) => {
				const csrfToken = getCsrfToken();
				return {
					url: '/project/export/start/',
					method: 'POST',
					body: { land_type, land_id, report_type },
					headers: csrfToken ? { 'X-CSRFToken': csrfToken } : {},
				};
			},
		}),
		downloadExportPdf: builder.query<Blob, { jobId: string; projectId: number }>({
			query: ({ jobId, projectId }) => ({
				url: `/project/export/download/${jobId}/?project_id=${projectId}`,
				responseHandler: (response) => response.blob(),
			}),
		}),
		getExportStatus: builder.query<{ status: 'pending' | 'completed' | 'failed'; error?: string }, string>({
			query: (jobId) => `/project/export/status/${jobId}/`,
		}),
		getReportDrafts: builder.query<ReportDraftListItem[], { projectId: number; reportType?: string }>({
			query: ({ projectId, reportType }) => {
				const params = new URLSearchParams({ project_id: projectId.toString() });
				if (reportType) params.append('report_type', reportType);
				return `/api/report-drafts/?${params}`;
			},
			providesTags: (result) =>
				result
					? [...result.map(({ id }) => ({ type: 'ReportDraft' as const, id })), { type: 'ReportDraft', id: 'LIST' }]
					: [{ type: 'ReportDraft', id: 'LIST' }],
		}),
		getReportDraft: builder.query<ReportDraft, string>({
			query: (id) => `/api/report-drafts/${id}/`,
			providesTags: (result, error, id) => [{ type: 'ReportDraft', id }],
		}),
		getReportTypes: builder.query<ReportTypeOption[], void>({
			query: () => '/api/report-drafts/report_types/',
		}),
		createReportDraft: builder.mutation<ReportDraft, CreateReportDraftPayload>({
			query: (body) => {
				const csrfToken = getCsrfToken();
				return {
					url: '/api/report-drafts/',
					method: 'POST',
					body,
					headers: csrfToken ? { 'X-CSRFToken': csrfToken } : {},
				};
			},
			invalidatesTags: [{ type: 'ReportDraft', id: 'LIST' }],
		}),
		updateReportDraft: builder.mutation<ReportDraft, UpdateReportDraftPayload>({
			query: ({ id, ...body }) => {
				const csrfToken = getCsrfToken();
				return {
					url: `/api/report-drafts/${id}/`,
					method: 'PATCH',
					body,
					headers: csrfToken ? { 'X-CSRFToken': csrfToken } : {},
				};
			},
			invalidatesTags: (result, error, { id }) => [{ type: 'ReportDraft', id }, { type: 'ReportDraft', id: 'LIST' }],
		}),
		deleteReportDraft: builder.mutation<void, string>({
			query: (id) => {
				const csrfToken = getCsrfToken();
				return {
					url: `/api/report-drafts/${id}/`,
					method: 'DELETE',
					headers: csrfToken ? { 'X-CSRFToken': csrfToken } : {},
				};
			},
			invalidatesTags: [{ type: 'ReportDraft', id: 'LIST' }],
		}),
	}),
	tagTypes: ['Project', 'ReportDraft'],
});

const useGetProjectQuery: UseGetProjectQueryType = djangoApi.useGetProjectQuery;
const useGetLandQuery: UseLandDetailType = djangoApi.useGetLandQuery;
const useGetArtifZonageIndexQuery: ArtifZonageIndexType = djangoApi.useGetArtifZonageIndexQuery;
const useGetImperZonageIndexQuery = djangoApi.useGetImperZonageIndexQuery;
const useRecordDownloadRequestMutation = djangoApi.useRecordDownloadRequestMutation;
const useUpdateProjectTarget2031Mutation = djangoApi.useUpdateProjectTarget2031Mutation;
const useUpdateProjectComparisonLandsMutation = djangoApi.useUpdateProjectComparisonLandsMutation;
const useGetLandFrichesStatutQuery: UseLandFrichesStatutType = djangoApi.useGetLandFrichesStatutQuery;
const useGetLandFrichesQuery: UseLandFrichesType = djangoApi.useGetLandFrichesQuery;
const useGetProjectDownloadLinksQuery = djangoApi.useGetProjectDownloadLinksQuery;
const useGetEnvironmentQuery: UseEnvTypes = djangoApi.useGetEnvironmentQuery;
const useGetLandGeomQuery = djangoApi.useGetLandGeomQuery;
const useStartExportPdfMutation = djangoApi.useStartExportPdfMutation;
const useLazyDownloadExportPdfQuery = djangoApi.useLazyDownloadExportPdfQuery;
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
	useGetLogementVacantAutorisationStatsQuery,
	useGetReportDraftsQuery,
	useGetReportDraftQuery,
	useGetReportTypesQuery,
	useCreateReportDraftMutation,
	useUpdateReportDraftMutation,
	useDeleteReportDraftMutation,
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
	useRecordDownloadRequestMutation,
	useUpdateProjectTarget2031Mutation,
	useUpdateProjectComparisonLandsMutation,
	useGetLandFrichesStatutQuery,
	useGetLandFrichesQuery,
	useGetProjectDownloadLinksQuery,
	useGetLandGeomQuery,
	useGetLogementVacantAutorisationStatsQuery,
	useStartExportPdfMutation,
	useLazyDownloadExportPdfQuery,
	useLazyGetExportStatusQuery,
	useGetReportDraftsQuery,
	useGetReportDraftQuery,
	useGetReportTypesQuery,
	useCreateReportDraftMutation,
	useUpdateReportDraftMutation,
	useDeleteReportDraftMutation,
};
