export interface Product {
  productId: string;
  userId: string;
  name: string;
  category: string;
  description: string;
  location: string;
  priceUSD: string;
  condition: string;
  tradePossible: boolean;
  contactDetails: {
    email: string;
    phoneNumber: string;
  };
  images: string[];
  formattedDateTime: string;
}
