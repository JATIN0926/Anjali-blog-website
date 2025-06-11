// src/redux/rootReducer.js
import { combineReducers } from "@reduxjs/toolkit";
import userReducer from "./slices/userSlice";
import blogDraftReducer from "./slices/blogDraftSlice";

const rootReducer = combineReducers({
  user: userReducer,
  blogDraft: blogDraftReducer,
});

export default rootReducer;
