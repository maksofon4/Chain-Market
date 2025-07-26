import React, { useState, useEffect, useContext } from "react";
import { SessionInfo } from "models/express-session";
import { Product } from "models/product";
import { ProductModal } from "Functions/ProductModal/ProductModal";
import "./productList.css";
import { SessionContext } from "GlobalData";

interface userInfo {
  profilePhoto: string;
  userId: string;
  username: string;
}

const ProductList = () => {
  const sessionInfo: SessionInfo = useContext(SessionContext);
  const [products, setProducts] = useState<Product[]>([]);

  const [selectedProducts, setSelectedProducts] = useState<string[] | null>(
    null
  );
  const [usersInfo, setUsersInfo] = useState<userInfo[] | null>(null);
  const [openedProduct, setOpenedProduct] = useState<Product | null>(null);
  const imageBaseUrl = "/uploads/";

  useEffect(() => {
    const fetchData = async () => {
      try {
        const sessionData = sessionInfo;
        // const usersRes = await fetch(`/api/users`);
        // const usersInfo = await usersRes.json();
        const productRes = await fetch(`/api/recent-products`);
        if (!productRes.ok) throw new Error("Failed to fetch product data");
        const products = await productRes.json();
        const userIds = products.map((product) => product.userId);
        const userRes = await fetch("/api/users-public-data", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ids: userIds }),
        });
        const users = await userRes.json();
        console.log(users);
        // Set session info and directly use sessionData to set selected products

        setSelectedProducts(sessionData.selectedProducts); // Now using sessionData directly
        setUsersInfo(users);

        setProducts(products);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, []);

  const isFavorite = (productId) => {
    if (selectedProducts) {
      return selectedProducts.includes(productId);
    }
    return false;
  };

  const addRemoveFavorites = async (
    event: React.MouseEvent,
    productId: string
  ) => {
    event.stopPropagation();
    if (!selectedProducts) return;
    if (selectedProducts.includes(productId)) {
      const updatedSelectedData = selectedProducts.filter(
        (product) => product !== productId
      );
      setSelectedProducts(updatedSelectedData);
      const removeReq = await fetch("/api/remove-product", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: sessionInfo?.userId,
          productIds: [productId],
        }),
      });
      if (!removeReq.ok) return;
    } else {
      const updatedSelectedData = [...selectedProducts, productId];
      setSelectedProducts(updatedSelectedData);
      const selectReq = await fetch("/api/select-product", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: sessionInfo?.userId,
          productIds: [productId],
        }),
      });
      if (!selectReq.ok) return;
    }
  };

  return (
    <div className="product-list-container">
      {openedProduct && (
        <ProductModal
          uploadedImgs={true}
          allUsersData={usersInfo}
          sessionInfo={sessionInfo}
          product={openedProduct}
          onClose={() => setOpenedProduct(null)}
        />
      )}
      <h1>New Ads</h1>
      <div className="product-list">
        {products.map((product) => (
          <div
            onClick={() => setOpenedProduct(product)}
            key={product.productId}
            className={`product`}
          >
            <img
              src={`${imageBaseUrl}${product.images?.[0]}`}
              alt={product.name}
            />
            <div className="product-info">
              <p className="name">{product.name}</p>
              <ul>
                <li className="product-location">{product.location}</li>
                <li className="release-date">{product.formattedDateTime}</li>
              </ul>
              <p className="price">{product.price}$</p>
            </div>

            <button
              onClick={(e) => addRemoveFavorites(e, product.productId)}
              className={
                isFavorite(product.productId)
                  ? "selectedButton Added"
                  : "selectedButton"
              }
            >
              <svg className="icon icon-envelop" viewBox="0 0 35 32">
                <use xlinkHref="symbol-defs.svg#icon-heart"></use>
              </svg>
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProductList;
