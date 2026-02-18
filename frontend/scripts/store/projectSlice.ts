import { createSlice } from '@reduxjs/toolkit'

const projectSlice = createSlice({
  name: 'project',
  initialState: {
    territoryName: null as string | null,
  },
  reducers: {
    setTerritoryName: (state, action) =>
    {
      state.territoryName = action.payload
    },
  },
})

export const { setTerritoryName } = projectSlice.actions
export default projectSlice.reducer
