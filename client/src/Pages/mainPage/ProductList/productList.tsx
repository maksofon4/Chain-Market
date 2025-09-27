import React, { useState, useEffect, useContext } from "react";
import { Product } from "models/product";
import { ProductModal } from "Components/ProductModal/ProductModal";
import "./productList.css";
import {
  toggleFavorite,
  isFavorite,
} from "Functions/FavoriteProducts/favoriteProducts";
import { usersInfo } from "models/users";
import { useFetchUserQuery } from "services/userService";

const ProductList = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const { data: user, refetch: refetchUser } = useFetchUserQuery();

  const [selectedProducts, setSelectedProducts] = useState<string[] | []>([]);
  const [usersInfo, setUsersInfo] = useState<usersInfo[] | null>(null);
  const [openedProduct, setOpenedProduct] = useState<Product | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
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

        setSelectedProducts(user ? user.selectedProducts : []);
        setUsersInfo(users);

        setProducts(products);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, []);

  const addRemoveFavorites = async (
    event: React.MouseEvent,
    productId: string
  ) => {
    event.stopPropagation();

    const updated = await toggleFavorite(productId, selectedProducts);
    if (!updated) return;

    setSelectedProducts(updated);
    refetchUser();
  };

  return (
    <div className="product-list-container pb-3">
      {openedProduct && (
        <ProductModal
          allUsersData={usersInfo}
          userInfo={user || null}
          product={openedProduct}
          onClose={() => setOpenedProduct(null)}
        />
      )}
      <h1>New Ads</h1>
      <div className="row row-cols-1 row-cols-sm-2 row-cols-md-3  gx-1 gy-1">
        {products.map((product) => (
          <div className="col">
            <div
              onClick={() => setOpenedProduct(product)}
              key={product.productId}
              className={`product w-100`}
            >
              <img src={`${product.images?.[0]}`} alt={product.name} />
              <div className="product-info">
                <p className="name">{product.name}</p>
                <ul className="list-unstyled">
                  <li className="product-location">{product.location}</li>
                  <li className="release-date">{product.formattedDateTime}</li>
                </ul>
                <p className="price">{product.price}$</p>
              </div>

              <button
                onClick={(e) => addRemoveFavorites(e, product.productId)}
                className={
                  isFavorite(product.productId, selectedProducts)
                    ? "selectedButton Added"
                    : "selectedButton"
                }
              >
                <svg className="icon icon-envelop" viewBox="0 0 35 32">
                  <use xlinkHref="symbol-defs.svg#icon-heart"></use>
                </svg>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProductList;
