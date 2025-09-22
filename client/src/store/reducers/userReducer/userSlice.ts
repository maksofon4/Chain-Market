import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { User } from "models/user";

interface UserState {
  user: User | null;
  isAuth: boolean;
  isLoading: boolean;
  error: string;
  initialized: boolean;
}

const initialState: UserState = {
  user: null,
  isAuth: false,
  isLoading: false,
  error: "",
  initialized: false,
};

export const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    userFetching(state) {
      state.isLoading = true;
    },

    userFetchingSuccess(state, action: PayloadAction<User>) {
      state.isLoading = false;
      state.isAuth = true;
      state.error = "";
      state.user = action.payload;
      state.initialized = true;
    },
    userFetchingError(state, action: PayloadAction<string>) {
      state.isLoading = false;
      state.error = action.payload;
      state.initialized = true;
    },
  },
});

export default userSlice.reducer;
