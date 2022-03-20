import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { tryValidateMasterCode } from "./depositBoxAPI";

import { validationTimeout, fetchCallTimeout } from "../../utils";

const initialState = {
  savedPassword: "",
  password: "",
  lock: false,
  status: "Ready",
  idle: true,
  serviceMode: false,
  sn: "4815162342",
  loading: false,
};

export const validateMasterCode = createAsyncThunk("depositBox/validateMasterCode", async ({ password, sn }, { dispatch }) => {
  dispatch(validationStart());
  const validationData = await tryValidateMasterCode(password);
  // console.log(validationData);
  setTimeout(() => {
    if (validationData?.sn === sn) {
      dispatch(validationSuccess());
    } else {
      dispatch(validationError());
    }
  }, fetchCallTimeout);
});

export const depositBoxSlice = createSlice({
  name: "depositBox",
  initialState,
  reducers: {
    addkey: (state, { payload }) => {
      state.password = !state.serviceMode && state.password.length === 6 ? state.password : state.password + payload;
      state.idle = false;
    },
    goToIdleState: (state) => {
      state.idle = true;
    },
    goToServiceMode: (state) => {
      state.serviceMode = true;
      state.status = "Service";
      state.password = "";
    },
    goToErrorState: (state) => {
      state.status = "Error";
      state.password = "";
      state.loading = false;
    },
    validationStart: (state) => {
      state.status = "Validating";
      state.loading = true;
      state.password = "";
    },
    validationSuccess: (state) => {
      state.status = "Ready";
      state.loading = false;
      state.lock = false;
      state.serviceMode = false;
      state.password = "";
      state.savedPassword = "";
    },
    validationError: (state) => {
      state.status = "Error";
      state.loading = false;
      state.password = "";
    },
    unlockDepositBox: (state) => {
      state.lock = true;
      state.status = "Unlocking";
      state.password = "";
      state.loading = true;
    },
    unlockDepositBoxSuccess: (state) => {
      state.lock = false;
      state.status = "Ready";
      state.password = "";
      state.loading = false;
    },
    lockDepositBox: (state, { payload }) => {
      state.lock = false;
      state.status = "Locking";
      state.savedPassword = payload;
      state.password = "";
      state.loading = true;
    },
    lockDepositBoxSuccess: (state) => {
      state.lock = true;
      state.status = "Ready";
      state.loading = false;
    },
  },
});

export const {
  addkey,
  goToErrorState,
  goToIdleState,
  goToServiceMode,
  lockDepositBox,
  lockDepositBoxSuccess,
  unlockDepositBox,
  validationError,
  validationStart,
  validationSuccess,
  unlockDepositBoxSuccess,
} = depositBoxSlice.actions;

export const locking = createAsyncThunk("depositBox/locking", (password, { dispatch }) => {
  dispatch(lockDepositBox(password));
  setTimeout(() => {
    dispatch(lockDepositBoxSuccess());
  }, validationTimeout);
});

export const unlocking = createAsyncThunk("depositBox/unlocking", ({ savedPassword, password }, { dispatch }) => {
  dispatch(unlockDepositBox());
  setTimeout(() => {
    if (savedPassword === password) {
      dispatch(unlockDepositBoxSuccess());
    } else {
      dispatch(goToErrorState());
    }
  }, validationTimeout);
});

export default depositBoxSlice.reducer;
