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
