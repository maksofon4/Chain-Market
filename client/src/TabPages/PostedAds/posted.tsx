import React, { useState, useEffect } from "react";
import { ProductModal } from "Functions/productInfo";
import "./posted.css";
const PostedList = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [imageBaseUrl, setImageBaseUrl] = useState("");
  const [sessionInfo, setSessionInfo] = useState<SessionInfo | undefined>(
    undefined
  );
  // const [postedProducts, setPostedProducts] = useState<Product[]>([]);
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

        const usersRes = await fetch(`/api/users`);
        const usersInfo = await usersRes.json();
        setUsersInfo(usersInfo);

        setSessionInfo(sessionData);
        const productRes = await fetch(`/api/user-posted-products`);
        if (!productRes.ok) throw new Error("Failed to fetch product data");
        const { products, imageBaseUrl } = await productRes.json();
        setProducts(products);
        setImageBaseUrl(imageBaseUrl);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, []);

  const removeProduct = async (productId: string) => {
    const removeRes = await fetch("/api/delete-product", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ productId }),
    });
    if (!removeRes.ok) return;
    const updateList = products.filter(
      (product) => product.productId !== productId
    );
    setProducts(updateList);
  };
  return (
    <div className="posted-product-list-container">
      {openedProduct && (
        <ProductModal
          allUsersData={usersInfo}
          sessionInfo={sessionInfo}
          product={openedProduct}
          onClose={() => setOpenedProduct(null)}
        />
      )}
      {products.length > 0 ? (
        <h1>All the products you posted</h1>
      ) : (
        <h1>
          You haven't posted anything yet, to add product click here{" "}
          <a href="/add-product" id="add-product-link">
            Add product
          </a>
        </h1>
      )}
      <div className="posted-product-list">
        {products.map((product) => (
          <div
            key={product.productId}
            className={`posted-product`}
            onClick={() => setOpenedProduct(product)}
          >
            <img
              src={`${imageBaseUrl}${product.images?.[0]}`}
              alt={product.name}
            />
            <div className="product-info">
              <p className="posted-name">{product.name}</p>
              <ul>
                <li className="posted-product-location">{product.location}</li>
                <li className="posted-release-date">
                  {product.formattedDateTime}
                </li>
              </ul>
              <p className="posted-price">{product.priceUSD}$</p>
            </div>

            <button
              className="posted-Product-Button"
              onClick={(e) => {
                e.stopPropagation();
                removeProduct(product.productId);
              }}
            >
              <svg viewBox="0 0 35 32">
                <use xlinkHref="symbol-defs.svg#icon-bin"></use>
              </svg>
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PostedList;
