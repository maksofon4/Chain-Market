import React, { useState, useEffect } from "react";
import { ProductModal } from "Functions/productInfo";
import "./selected.css";
const SelectedList = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [imageBaseUrl, setImageBaseUrl] = useState("");
  const [sessionInfo, setSessionInfo] = useState<SessionInfo | undefined>(
    undefined
  );
  const [selectedProducts, setSelectedProducts] = useState<Product[]>([]);
  const [openedProduct, setOpenedProduct] = useState<Product | null>(null);
  const [usersInfo, setUsersInfo] = useState("");

  interface Product {
    productId: string;
    userId: string;
    name: string;
    category: string;
    description: string;
    location: string;
    priceUSD: string;
    condition: string;
    tradePossible: string;
    contactDetails: {
      email: string;
      phoneNumber: string;
    };
    images: string[];
    formattedDateTime: string;
  }
  interface SessionInfo {
    userId: string;
    username: string;
    email: string;
    password: string;
    profilePhoto: string;
    pinnedChats: string[];
    selectedProducts: string[];
  }

  useEffect(() => {
    const fetchData = async () => {
      try {
        const sessionRes = await fetch(`/api/session-info`);
        const sessionData = await sessionRes.json();
        setSessionInfo(sessionData);
        const productRes = await fetch(`/api/New-ads`);
        if (!productRes.ok) throw new Error("Failed to fetch product data");
        const usersRes = await fetch(`/api/users`);
        const usersInfo = await usersRes.json();
        const { products, imageBaseUrl } = await productRes.json();
        setProducts(products);
        setImageBaseUrl(imageBaseUrl);
        setUsersInfo(usersInfo);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    if (sessionInfo) {
      const selectedIds = sessionInfo.selectedProducts ?? [];
      const filteredProducts = products.filter((product) =>
        selectedIds.includes(product.productId)
      );
      setSelectedProducts(filteredProducts);
    }
  }, [sessionInfo, products]);

  const removeFromFavorites = async (productId: string) => {
    const removeRes = await fetch("/api/remove-product", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        userId: sessionInfo?.userId,
        productIds: [productId],
      }),
    });
    if (!removeRes.ok) return;
    const updateList = selectedProducts.filter(
      (product) => product.productId !== productId
    );
    setSelectedProducts(updateList);
  };
  return (
    <div className="selected-product-list-container">
      {openedProduct && (
        <ProductModal
          uploadedImgs={true}
          allUsersData={usersInfo}
          sessionInfo={sessionInfo}
          product={openedProduct}
          onClose={() => setOpenedProduct(null)}
        />
      )}
      {selectedProducts.length > 0 ? (
        <h1>The products you added to favorites</h1>
      ) : (
        <h1>You haven't added any product to favorites</h1>
      )}
      <div className="selected-product-list">
        {selectedProducts.map((product) => (
          <div
            key={product.productId}
            className={`selected-product`}
            onClick={() => setOpenedProduct(product)}
          >
            <img
              src={`${imageBaseUrl}${product.images?.[0]}`}
              alt={product.name}
            />
            <div className="product-info">
              <p className="selected-name">{product.name}</p>
              <ul>
                <li className="selected-product-location">
                  {product.location}
                </li>
                <li className="selected-release-date">
                  {product.formattedDateTime}
                </li>
              </ul>
              <p className="selected-price">{product.priceUSD}$</p>
            </div>

            <button
              className="selected-Product-Button"
              onClick={(e) => {
                e.stopPropagation();
                removeFromFavorites(product.productId);
              }}
            >
              <svg className="icon icon-envelop" viewBox="0 0 35 32">
                <use xlinkHref="symbol-defs.svg#icon-cross"></use>
              </svg>
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SelectedList;
