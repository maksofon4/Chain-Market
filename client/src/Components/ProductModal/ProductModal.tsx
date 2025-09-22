import React, { useEffect, useState } from "react";
import { userProfilePhoto, userName } from "../../Functions/Users/usersInfo";
import { ProductModalProps } from "models/product";
import { useNavigate } from "react-router-dom";
import "./ProductModal.css";

export const ProductModal: React.FC<ProductModalProps> = ({
  uploadedImgs,
  allUsersData,
  userInfo,
  product,
  onClose,
}) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const navigate = useNavigate();

  const navigateUserToChat = (userId, product) => {
    // ADD CHECK ISAUTH
    localStorage.setItem("product", JSON.stringify(product));

    navigate(`/messages/chat/${userId}`);
  };
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
        <div className="productHeaderInfo">
          {allUsersData && (
            <>
              <img
                src={userProfilePhoto(allUsersData, product.userId)}
                alt="Profile"
              />

              <p className="username">
                {userName(allUsersData, product.userId)}
              </p>
              <p className="releaseDate">{product.formattedDateTime}</p>
            </>
          )}

          <button onClick={onClose} className="closeButton">
            Close
          </button>
        </div>

        <div className="productImgs">
          {product.images.length > 1 && (
            <button onClick={prevImage} id="left-button">
              <svg width="24" height="24">
                <use xlinkHref="symbol-defs.svg#icon-arrow-down-new"></use>
              </svg>
            </button>
          )}
          <img
            src={
              uploadedImgs
                ? `${product.images[currentImageIndex]}`
                : `${product.images[currentImageIndex]}`
            }
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
          {(!userInfo || userInfo.userId !== product.userId) && (
            <button
              className="messageUserButton"
              onClick={() => navigateUserToChat(product.userId, product)}
            >
              Message
            </button>
          )}

          <p className="currentProductName">{product.name}</p>
          <p className="currentProductPrice">{product.price}$</p>
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
