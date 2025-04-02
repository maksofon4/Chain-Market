import React, { useEffect, useState } from "react";
import { UserProfile } from "./userInfo";
import "./productInfo.css";

interface Product {
  productId: string;
  userId: string;
  name: string;
  category: string;
  description: string;
  location: string;
  priceUSD: string; // If it's always a string, otherwise use `number`
  condition: string;
  tradePossible: boolean; // Consider using `boolean` if possible
  contactDetails: {
    email: string;
    phoneNumber: string;
  };
  images: string[];
  formattedDateTime: string;
}

interface ProductModalProps {
  uploadedImgs: boolean;
  allUsersData: any;
  sessionInfo?: SessionInfo;
  product: Product;
  onClose: () => void;
}

interface SessionInfo {
  userId: string;
  username: string;
  email: string;
  profilePhoto: string;
  pinnedChats: string[];
  selectedProducts: string[];
}

export const ProductModal: React.FC<ProductModalProps> = ({
  allUsersData,
  sessionInfo,
  product,
  onClose,
}) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const nextImage = () => {
    setCurrentImageIndex((prevIndex) =>
      prevIndex < product.images.length - 1 ? prevIndex + 1 : 0
    );
  };

  const prevImage = () => {
    setCurrentImageIndex((prevIndex) =>
      prevIndex > 0 ? prevIndex - 1 : product.images.length - 1
    );
  };

  const handleModalContentClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  return (
    <div className="transparent-background" onClick={onClose}>
      <div className="overflowWindow" onClick={handleModalContentClick}>
        {allUsersData && (
          <div className="productHeaderInfo">
            <UserProfile
              data={allUsersData}
              userId={product.userId}
              dataType="photo"
            />
            <UserProfile
              data={allUsersData}
              userId={product.userId}
              dataType="name"
            />
            <p className="releaseDate">{product.formattedDateTime}</p>
            <button onClick={onClose} className="closeButton">
              Close
            </button>
          </div>
        )}
        <div className="productImgs">
          {product.images.length > 1 && (
            <button onClick={prevImage} id="left-button">
              <svg width="24" height="24">
                <use xlinkHref="symbol-defs.svg#icon-arrow-down-new"></use>
              </svg>
            </button>
          )}
          <img
            src={product.images[currentImageIndex]}
            alt="Product"
          />
          {product.images.length > 1 && (
            <button onClick={nextImage} id="right-button">
              <svg width="24" height="24">
                <use xlinkHref="symbol-defs.svg#icon-arrow-down-new"></use>
              </svg>
            </button>
          )}
        </div>
        <div className="productInfo">
          <ul>
            <li className="productCategory">{product.category}</li>
            <li className="status">{product.condition}</li>
            <li className="tradeCondition">
              {product.tradePossible
                ? "Trade is possible"
                : "Trade is not possible"}
            </li>
          </ul>
          {sessionInfo && sessionInfo.userId !== product.userId && (
            <button className="messageUserButton">Message</button>
          )}

          <p className="currentProductName">{product.name}</p>
          <p className="currentProductPrice">{product.priceUSD}$</p>
          <p className="currentProductLocation">{product.location}</p>
          <p className="description">{product.description}</p>
        </div>
        <div className="contactDetails">
          <p>Contact details</p>
          <ul>
            <li className="email">{product.contactDetails.email}</li>
            <li className="phonenumber">
              {product.contactDetails.phoneNumber}
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};
