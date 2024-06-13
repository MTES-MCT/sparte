import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'

export const djangoApi = createApi({
  reducerPath: 'djangoApi',
  baseQuery: fetchBaseQuery({ baseUrl: '/api/v2/', credentials: 'include' }),
  endpoints: (builder) => ({
    getProject: builder.query({
      query: (id) => `projects/${id}/`,
    }),
  }),
})

export const publicApi = createApi({
  reducerPath: 'publicApi',
  baseQuery: fetchBaseQuery({ baseUrl: '/public/' }),
  endpoints: (builder) => ({
    getDepartementList: builder.query({
      query: () => 'departements/',
    }),
  }),
})

export const {
  useGetProjectQuery,
} = djangoApi

export const {
  useGetDepartementListQuery,
} = publicApi
