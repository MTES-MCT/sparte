import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import getCsrfToken from '../utils/csrf.ts'

export const djangoApi = createApi({
  reducerPath: 'djangoApi',
  baseQuery: fetchBaseQuery({ credentials: 'include' }),
  endpoints: (builder) => ({
    getDepartementList: builder.query({
      query: () => '/public/departements/',
    }),
    getProject: builder.query({
      query: (id) => `/project/${id}/detail`,
    }),
    searchTerritory: builder.query({
      query: (needle) =>
      {
        const csrfToken = getCsrfToken()
        return {
          url: '/public/search-land',
          method: 'POST',
          body: { needle },
          headers: csrfToken ? { 'X-CSRFToken': csrfToken } : {},
        }
      },
    }),
  }),
})

export const {
  useGetDepartementListQuery,
  useGetProjectQuery,
  useSearchTerritoryQuery,
} = djangoApi
