import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { User } from "models/user";

export const messageApi = createApi({
  reducerPath: "messageApi",
  baseQuery: fetchBaseQuery({ baseUrl: "/api" }),
  endpoints: (build) => ({
    fetchChatHistory: build.query<User, void>({
      query: () => ({
        url: `/chats-history`,
      }),
    }),
    markAsChecked: build.mutation<{ message: string }, Partial<User>>({
      query: (data) => ({
        url: "/update-message-status",
        method: "POST",
        body: data,
      }),
    }),
  }),
});
export const { useFetchChatHistoryQuery, useMarkAsCheckedMutation } =
  messageApi;
