import { User } from "./user";

export interface Product {
  productId: string;
  userId: string;
  name: string;
  category: string;
  description: string;
  location: string;
  price: string;
  condition: string;
  tradePossible: boolean;
  contactDetails: {
    email: string;
    phoneNumber: string;
  };
  images: string[];
  formattedDateTime: string;
}

export interface ProductModalProps {
  uploadedImgs: boolean;
  allUsersData: any;
  userInfo: User | null;
  product: Product;
  onClose: () => void;
}
