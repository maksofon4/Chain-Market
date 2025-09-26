import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { User } from "models/user";

export const userApi = createApi({
  reducerPath: "userApi",
  baseQuery: fetchBaseQuery({ baseUrl: "/api" }),
  endpoints: (build) => ({
    fetchUser: build.query<User, void>({
      query: () => ({
        url: `/auth`,
      }),
    }),
  }),
});
export const { useFetchUserQuery } = userApi;
