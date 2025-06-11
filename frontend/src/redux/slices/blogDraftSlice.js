import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  title: "",
  content: "",  
  tags: [],
  selectedOption: "",
};

const blogDraftSlice = createSlice({
  name: "blogDraft",
  initialState,
  reducers: {
    setTitle: (state, action) => {
      state.title = action.payload;
    },
    setContent: (state, action) => {
      state.content = action.payload;
    },
    setTags: (state, action) => {
      state.tags = action.payload;
    },
    setSelectedOption: (state, action) => {
      state.selectedOption = action.payload;
    },
    clearDraft: () => initialState,
  },
});

export const {
  setTitle,
  setContent,
  setTags,
  setSelectedOption,
  clearDraft,
} = blogDraftSlice.actions;

export default blogDraftSlice.reducer;
