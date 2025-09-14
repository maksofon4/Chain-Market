import React, { useState, useEffect, useContext } from "react";
import { ProductModal } from "Components/ProductModal/ProductModal";
import { Product } from "models/product";
import { SessionInfo } from "models/express-session";
import { SessionContext } from "Components/GlobalData/GlobalData";
import { useNavigate } from "react-router-dom";

import "./posted.css";

const PostedList = () => {
  const sessionInfo = useContext(SessionContext);
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>([]);

  // const [postedProducts, setPostedProducts] = useState<Product[]>([]);
  const [openedProduct, setOpenedProduct] = useState<Product | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const productRes = await fetch(`/api/user-posted-products`);
        if (!productRes.ok) throw new Error("Failed to fetch product data");
        const products = await productRes.json();
        setProducts(products);
        console.log(products);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, []);

  const removeProduct = async (productId: string) => {
    const removeRes = await fetch("/api/delete-product", {
      method: "DELETE",
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
          allUsersData={[sessionInfo?.user]}
          sessionInfo={sessionInfo.user}
          product={openedProduct}
          onClose={() => setOpenedProduct(null)}
        />
      )}
      {products.length > 0 ? (
        <h1>All the products you posted</h1>
      ) : (
        <h1>
          You haven't posted anything yet, to add product click here{" "}
          <a onClick={() => navigate("/add-product")} id="add-product-link">
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
            <img src={`${product.images?.[0]}`} alt={product.name} />
            <div className="product-info">
              <p className="posted-name">{product.name}</p>
              <ul>
                <li className="posted-product-location">{product.location}</li>
                <li className="posted-release-date">
                  {product.formattedDateTime}
                </li>
              </ul>
              <p className="posted-price">{product.price}$</p>
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
