import { AppDispatch } from "store/store";
import { userSlice } from "./userSlice";

export const fetchUser = () => async (dispatch: AppDispatch) => {
  try {
    dispatch(userSlice.actions.userFetching());
    const sessionInfoReq = await fetch(`/api/auth`, {
      credentials: "include",
    });
    const sessionInfo = await sessionInfoReq.json();

    if (!sessionInfoReq.ok) {
      throw new Error(sessionInfo.message || "Failed to fetch user");
    }

    dispatch(userSlice.actions.userFetchingSuccess(sessionInfo));
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    dispatch(userSlice.actions.userFetchingError(message));
  }
};
