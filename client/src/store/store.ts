import { configureStore } from "@reduxjs/toolkit";
import { userApi } from "services/userService";
import { messageApi } from "services/messageServices";
import { setupListeners } from "@reduxjs/toolkit/query";
import { messagesSlice } from "./reducers/messagesSlice";

export const store = configureStore({
  reducer: {
    [userApi.reducerPath]: userApi.reducer,
    [messageApi.reducerPath]: messageApi.reducer,
    messages: messagesSlice.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(userApi.middleware, messageApi.middleware),
});

setupListeners(store.dispatch);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
