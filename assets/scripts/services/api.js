import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'

export const djangoApi = createApi({
  reducerPath: 'djangoApi',
  baseQuery: fetchBaseQuery({ credentials: 'include' }),
  endpoints: (builder) => ({
    getDepartementList: builder.query({
      query: () => '/public/departements/',
    }),
  }),
})

export const {
  useGetDepartementListQuery,
} = djangoApi
