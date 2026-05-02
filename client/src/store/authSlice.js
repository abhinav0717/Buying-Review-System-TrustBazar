import { createSlice } from "@reduxjs/toolkit";

const stored = JSON.parse(localStorage.getItem("trustbazaar_auth") || "null");

const authSlice = createSlice({
  name: "auth",
  initialState: {
    user: stored?.user || null,
    token: stored?.token || null
  },
  reducers: {
    setCredentials(state, action) {
      state.user = action.payload.user;
      state.token = action.payload.token;
      localStorage.setItem("trustbazaar_auth", JSON.stringify(action.payload));
    },
    logout(state) {
      state.user = null;
      state.token = null;
      localStorage.removeItem("trustbazaar_auth");
    }
  }
});

export const { logout, setCredentials } = authSlice.actions;
export const selectAuth = (state) => state.auth;
export default authSlice.reducer;

