import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'

export const djangoApi = createApi({
  reducerPath: 'djangoApi',
  baseQuery: fetchBaseQuery({ credentials: 'include' }),
  endpoints: (builder) => ({
    getDepartementList: builder.query({
      query: () => '/public/departements/',
    }),
    getProject: builder.query({
      query: (id) => `/projects/${id}/`,
    }),
  }),
})

export const {
  useGetDepartementListQuery,
  useGetProjectQuery,
} = djangoApi
