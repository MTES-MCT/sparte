import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface ProjectState {
  projectData: any | null;
}

const initialState: ProjectState = {
  projectData: null,
};

const projectSlice = createSlice({
  name: 'project',
  initialState,
  reducers: {
    setProjectData: (state, action: PayloadAction<any>) => {
      state.projectData = action.payload;
    },
    clearProjectData: (state) => {
      state.projectData = null;
    },
  },
});

export const { setProjectData, clearProjectData } = projectSlice.actions;
export default projectSlice.reducer;
