import { use } from "react";

interface user {
  userId: string | null;
  username: string | null;
  profilePhoto: string | null;
}

export const userProfilePhoto = (data: user[], userId: string) => {
  const user = data.find((user) => user.userId === userId);
  return user ? user.profilePhoto : null;
};

export const userName = (data: user[], userId: string) => {
  const user = data.find((user) => user.userId === userId);

  return user ? user.username : null;
};
