import React, { useState, useEffect, useContext } from "react";
import { ProductModal } from "Components/ProductModal/ProductModal";
import { Product } from "models/product";
import { SessionInfo } from "models/express-session";
import { SessionContext } from "Components/GlobalData/GlobalData";
import "./selected.css";

const SelectedList = () => {
  const sessionInfo = useContext(SessionContext);
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProducts, setSelectedProducts] = useState<Product[]>([]);
  const [openedProduct, setOpenedProduct] = useState<Product | null>(null);
  const [usersInfo, setUsersInfo] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        // product data
        const productRes = await fetch(`/api/user-favorite-products`);
        if (!productRes.ok) throw new Error("Failed to fetch product data");
        const products = await productRes.json();
        // user data
        const userIds = products.map((product) => product.userId);
        const userRes = await fetch("/api/users-public-data", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ids: userIds }),
        });
        const users = await userRes.json();
        setProducts(products);
        setUsersInfo(users);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    if (sessionInfo) {
      const selectedIds = sessionInfo.user.selectedProducts ?? [];
      const filteredProducts = products.filter((product) =>
        selectedIds.includes(product.productId)
      );
      setSelectedProducts(filteredProducts);
    }
  }, [sessionInfo, products]);

  const removeFromFavorites = async (productId: string) => {
    const removeRes = await fetch("/api/remove-product-from-favorites", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        productIds: [productId],
      }),
    });
    if (!removeRes.ok) return;
    sessionInfo?.refreshUser();
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
          sessionInfo={sessionInfo.user}
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
            <img src={`${product.images?.[0]}`} alt={product.name} />
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
              <p className="selected-price">{product.price}$</p>
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
