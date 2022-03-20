import { configureStore } from "@reduxjs/toolkit";
import depositBoxReducer from "../features/deposit-box/depositBoxSlice";

export const store = configureStore({
  reducer: {
    depositBox: depositBoxReducer,
  },
});
