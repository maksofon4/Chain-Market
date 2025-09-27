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
    updateProfile: build.mutation<{ message: string }, Partial<User>>({
      query: (data) => ({
        url: "/update-profile",
        method: "POST",
        body: data,
      }),
    }),
    updateProfilePhoto: build.mutation<{ message: string }, FormData>({
      query: (formData) => ({
        url: "/update-profile-photo",
        method: "POST",
        body: formData,
      }),
    }),
  }),
});
export const {
  useFetchUserQuery,
  useUpdateProfileMutation,
  useUpdateProfilePhotoMutation,
} = userApi;
