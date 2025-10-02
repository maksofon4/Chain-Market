import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { Message } from "models/messages";

export const messageApi = createApi({
  reducerPath: "messageApi",
  baseQuery: fetchBaseQuery({ baseUrl: "/api" }),
  endpoints: (build) => ({
    fetchChatHistory: build.query<Message[], void>({
      query: () => ({
        url: `/chats-history`,
      }),
    }),
    markAsChecked: build.mutation<{ message: string }, string>({
      query: (data) => ({
        url: "/update-message-status",
        method: "POST",
        body: { forUserId: data },
      }),
    }),
  }),
});
export const { useFetchChatHistoryQuery, useMarkAsCheckedMutation } =
  messageApi;
