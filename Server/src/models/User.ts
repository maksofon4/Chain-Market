export interface User {
  user_id: string;
  user_name: string;
  email: string;
  password: string;
  profile_photo: string;
  pinned_chats: string[];
  selected_products: string[];
}

export interface UserPublic {
  user_id: string;
  user_name: string;
  profile_photo: string;
  pinned_chats: string[];
  selected_products: string[];
}
