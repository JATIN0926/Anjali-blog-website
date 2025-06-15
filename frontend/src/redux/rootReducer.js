// src/redux/rootReducer.js
import { combineReducers } from "@reduxjs/toolkit";
import userReducer from "./slices/userSlice";
import blogDraftReducer from "./slices/blogDraftSlice";
import authUiReducer from "./slices/authUiSlice";


const rootReducer = combineReducers({
  user: userReducer,
  blogDraft: blogDraftReducer,
  authUi: authUiReducer,
});

export default rootReducer;
