import { createSlice } from '@reduxjs/toolkit'

const projectSlice = createSlice({
  name: 'project',
  initialState: {
    projectData: null,
  },
  reducers: {
    setProjectData: (state, action) =>
    {
      state.projectData = action.payload
    },
    clearProjectData: (state) =>
    {
      state.projectData = null
    },
  },
})

export const { setProjectData, clearProjectData } = projectSlice.actions
export default projectSlice.reducer
