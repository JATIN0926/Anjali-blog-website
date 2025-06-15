import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  showFallbackPopup: false,
};

const authUiSlice = createSlice({
  name: "authUi",
  initialState,
  reducers: {
    setShowFallbackPopup: (state, action) => {
      state.showFallbackPopup = action.payload;
    },
  },
});

export const { setShowFallbackPopup } = authUiSlice.actions;
export default authUiSlice.reducer;
