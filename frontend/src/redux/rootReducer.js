// src/redux/rootReducer.js
import { combineReducers } from "@reduxjs/toolkit";
import userReducer from "./slices/userSlice";

const rootReducer = combineReducers({
  user: userReducer,
  // add other reducers here
});

export default rootReducer;
