import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import getCsrfToken from "@utils/csrf";
import { UserLandPreferenceResultType } from "./types/project";
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

export type CurrentUserResponse = {
	is_authenticated: boolean;
	id?: number;
	email?: string;
	first_name?: string;
	last_name?: string;
	organism?: string | null;
	function?: string | null;
	groups: string[];
};

export const djangoApi = createApi({
	reducerPath: "djangoApi",
	baseQuery: fetchBaseQuery({ credentials: "include" }),
	keepUnusedDataFor: 600,
	endpoints: (builder) => ({
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
		getLandArtifFluxIndex: builder.query({
			query: ({ land_type, land_id, millesime_old_index, millesime_new_index }) => {
				return `/api/landartiffluxindex/?${new URLSearchParams({
					land_type,
					land_id,
					millesime_old_index: String(millesime_old_index),
					millesime_new_index: String(millesime_new_index),
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
		getCarroyageBounds: builder.query({
			query: ({ land_type, land_id, start_year, end_year }: { land_type: string; land_id: string; start_year: number; end_year: number }) => {
				return `/api/landcarroyagebounds/?${new URLSearchParams({
					land_type,
					land_id,
					start_year: start_year.toString(),
					end_year: end_year.toString(),
				})}`
			},
		}),
		getCarroyageDestinationConfig: builder.query({
			query: () => "/carroyage-destination-config",
		}),
		getDepartementList: builder.query({
			query: () => "/api/lands/?land_type=departement",
		}),
		getLand: builder.query({
			query: ({ land_type, land_id }) => `/api/lands/${land_type}/${land_id}`,
		}),
		getLandGeom: builder.query({
			query: ({ land_type, land_id }) => `/api/landsgeom/${land_type}/${land_id}`,
		}),
		getLandChildrenGeom: builder.query({
			query: ({ land_type, land_id, child_land_type }) => `/api/landchildrengeom/${land_type}/${land_id}/${child_land_type}`,
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
		getUserLandPreference: builder.query<
			UserLandPreferenceResultType,
			{ land_type: string; land_id: string }
		>({
			query: ({ land_type, land_id }) => `/api/preference/${land_type}/${land_id}/`,
			providesTags: (result, error, { land_type, land_id }) => [{ type: 'Preference', id: `${land_type}_${land_id}` }],
		}),
		updatePreferenceTarget2031: builder.mutation<
			{ success: boolean; target_2031: number },
			{ land_type: string; land_id: string; target_2031: number }
		>({
			query: ({ land_type, land_id, target_2031 }) => {
				const csrfToken = getCsrfToken();
				return {
					url: `/api/preference/${land_type}/${land_id}/target-2031/`,
					method: 'POST',
					body: { target_2031 },
					headers: csrfToken ? { 'X-CSRFToken': csrfToken } : {},
				};
			},
			invalidatesTags: (result, error, { land_type, land_id }) => [{ type: 'Preference', id: `${land_type}_${land_id}` }],
		}),
		updatePreferenceComparisonLands: builder.mutation<
			{ success: boolean; comparison_lands: Array<{ land_type: string; land_id: string; name: string }> },
			{ land_type: string; land_id: string; comparison_lands: Array<{ land_type: string; land_id: string; name: string }> }
		>({
			query: ({ land_type, land_id, comparison_lands }) => {
				const csrfToken = getCsrfToken();
				return {
					url: `/api/preference/${land_type}/${land_id}/comparison-lands/`,
					method: 'POST',
					body: { comparison_lands },
					headers: csrfToken ? { 'X-CSRFToken': csrfToken } : {},
				};
			},
			invalidatesTags: (result, error, { land_type, land_id }) => [{ type: 'Preference', id: `${land_type}_${land_id}` }],
		}),
		toggleFavorite: builder.mutation<
			{ success: boolean; is_favorited: boolean },
			{ land_type: string; land_id: string }
		>({
			query: ({ land_type, land_id }) => {
				const csrfToken = getCsrfToken();
				return {
					url: `/api/preference/${land_type}/${land_id}/toggle-favorite/`,
					method: 'POST',
					headers: csrfToken ? { 'X-CSRFToken': csrfToken } : {},
				};
			},
			invalidatesTags: (result, error, { land_type, land_id }) => [{ type: 'Preference', id: `${land_type}_${land_id}` }],
		}),
		startExportPdf: builder.mutation<{ jobId: string }, { draftId: string }>({
			query: ({ draftId }) => {
				const csrfToken = getCsrfToken();
				return {
					url: '/diagnostic/export/start/',
					method: 'POST',
					body: { draft_id: draftId },
					headers: csrfToken ? { 'X-CSRFToken': csrfToken } : {},
				};
			},
		}),
		getExportStatus: builder.query<{ status: 'pending' | 'completed' | 'failed'; error?: string }, string>({
			query: (jobId) => `/diagnostic/export/status/${jobId}/`,
		}),
		getReportDrafts: builder.query<ReportDraftListItem[], { landType: string; landId: string; reportType?: string }>({
			query: ({ landType, landId, reportType }) => {
				const params = new URLSearchParams({ land_type: landType, land_id: landId });
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
		getCurrentUser: builder.query<CurrentUserResponse, void>({
			query: () => '/api/me/',
		}),
	}),
	tagTypes: ['ReportDraft', 'Preference'],
});

const useGetLandQuery: UseLandDetailType = djangoApi.useGetLandQuery;
const useGetArtifZonageIndexQuery: ArtifZonageIndexType = djangoApi.useGetArtifZonageIndexQuery;
const useGetImperZonageIndexQuery = djangoApi.useGetImperZonageIndexQuery;
const useGetUserLandPreferenceQuery = djangoApi.useGetUserLandPreferenceQuery;
const useUpdatePreferenceTarget2031Mutation = djangoApi.useUpdatePreferenceTarget2031Mutation;
const useUpdatePreferenceComparisonLandsMutation = djangoApi.useUpdatePreferenceComparisonLandsMutation;
const useGetLandFrichesStatutQuery: UseLandFrichesStatutType = djangoApi.useGetLandFrichesStatutQuery;
const useGetLandFrichesQuery: UseLandFrichesType = djangoApi.useGetLandFrichesQuery;
const useGetEnvironmentQuery: UseEnvTypes = djangoApi.useGetEnvironmentQuery;
const useGetLandGeomQuery = djangoApi.useGetLandGeomQuery;
const useToggleFavoriteMutation = djangoApi.useToggleFavoriteMutation;
const useStartExportPdfMutation = djangoApi.useStartExportPdfMutation;
const useLazyGetExportStatusQuery = djangoApi.useLazyGetExportStatusQuery;

const {
	useGetDepartementListQuery,
	useSearchTerritoryQuery,
	useGetChartConfigQuery,
	useGetLandArtifStockIndexQuery,
	useGetLandArtifFluxIndexQuery,
	useGetLandImperStockIndexQuery,
	useGetLandConsoStatsQuery,
	useGetLandPopStatsQuery,
	useGetLandPopDensityQuery,
	useGetSimilarTerritoriesQuery,
	useGetLogementVacantAutorisationStatsQuery,
	useGetCarroyageBoundsQuery,
	useGetCarroyageDestinationConfigQuery,
	useGetLandChildrenGeomQuery,
	useGetReportDraftsQuery,
	useGetReportDraftQuery,
	useGetReportTypesQuery,
	useCreateReportDraftMutation,
	useUpdateReportDraftMutation,
	useDeleteReportDraftMutation,
	useGetCurrentUserQuery,
} = djangoApi;

export {
	useGetDepartementListQuery,
	useGetEnvironmentQuery,
	useSearchTerritoryQuery,
	useGetChartConfigQuery,
	useGetLandQuery,
	useGetArtifZonageIndexQuery,
	useGetImperZonageIndexQuery,
	useGetLandArtifStockIndexQuery,
	useGetLandArtifFluxIndexQuery,
	useGetLandImperStockIndexQuery,
	useGetLandConsoStatsQuery,
	useGetLandPopStatsQuery,
	useGetLandPopDensityQuery,
	useGetSimilarTerritoriesQuery,
	useGetUserLandPreferenceQuery,
	useUpdatePreferenceTarget2031Mutation,
	useUpdatePreferenceComparisonLandsMutation,
	useToggleFavoriteMutation,
	useGetLandFrichesStatutQuery,
	useGetLandFrichesQuery,
	useGetLandGeomQuery,
	useGetLandChildrenGeomQuery,
	useGetLogementVacantAutorisationStatsQuery,
	useGetCarroyageBoundsQuery,
	useGetCarroyageDestinationConfigQuery,
	useStartExportPdfMutation,
	useLazyGetExportStatusQuery,
	useGetReportDraftsQuery,
	useGetReportDraftQuery,
	useGetReportTypesQuery,
	useCreateReportDraftMutation,
	useUpdateReportDraftMutation,
	useDeleteReportDraftMutation,
	useGetCurrentUserQuery,
};
