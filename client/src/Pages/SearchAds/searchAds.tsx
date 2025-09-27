import SearchBar from "Components/SearchBar/SearchBar";
import "./searchAds.css";
import { useState, useEffect, useMemo, useRef } from "react";
import { useLocation } from "react-router-dom";
import { categories } from "clientSideInfo";
import { ProductModal } from "Components/ProductModal/ProductModal";
import { Product } from "models/product";
import { usersInfo } from "models/users";
import {
  isFavorite,
  toggleFavorite,
} from "Functions/FavoriteProducts/favoriteProducts";
import { useFetchUserQuery } from "services/userService";

const SearchAds: React.FC = () => {
  const { data: user, refetch: refreshUser } = useFetchUserQuery();
  const [products, setProducts] = useState<Product[]>([]);
  const [usersInfo, setUsersInfo] = useState<usersInfo[] | null>(null);
  const [condition, setCondition] = useState<string | null>(null);
  const [isTradePossible, setTradePossible] = useState<boolean | null>(null);
  const [priceMin, setPriceMin] = useState<number | null>(null);
  const [priceMax, setPriceMax] = useState<number | null>(null);
  const [name, setName] = useState<string | null>(null);
  const [location, setLocation] = useState<string | null>();
  const [openedProduct, setOpenedProduct] = useState<Product | null>(null);
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [category, setCategory] = useState<string | null>(null);
  const [categorySelectActive, setCategorySelectActive] =
    useState<boolean>(false);
  const [categoryIcon, setCategoryIcon] = useState<string | null>(null);

  // UPDATE TO USEQUERRYSTATE Logic
  const queryString = useMemo(() => {
    const params = new URLSearchParams();
    if (category && category !== "Any") params.append("category", category);
    if (location) params.append("location", location);

    if (priceMin) params.append("priceMin", String(priceMin));
    if (priceMax) params.append("priceMax", String(priceMax));
    if (condition) params.append("condition", condition);
    if (isTradePossible !== null)
      params.append("tradePossible", String(isTradePossible));
    if (name) params.append("name", name);

    return params.toString();
  }, [
    category,
    priceMin,
    priceMax,
    condition,
    isTradePossible,
    name,
    location,
  ]);

  const firstRender = useRef(true);
  const Winlocation = useLocation();

  useEffect(() => {
    const fetchProducts = async () => {
      let currentQuery: string;

      if (firstRender.current) {
        currentQuery = Winlocation.search.slice(1);
        const params = new URLSearchParams(Winlocation.search);
        const nameFromUrl = params.get("name");
        const locationFromUrl = params.get("location");

        setName(nameFromUrl);
        setLocation(locationFromUrl);
        const categoryFromUrl = params.get("category");
        if (categoryFromUrl) {
          const foundCategory = categories.find(
            (category) =>
              category.name === categoryFromUrl ||
              category.id === categoryFromUrl
          );

          if (foundCategory) {
            setCategory(foundCategory.id);
            setCategoryIcon(foundCategory.href);
          }
        }

        firstRender.current = false;
      } else {
        currentQuery = queryString;

        window.history.replaceState(null, "", `?${queryString}`);
      }

      const res = await fetch(`/api/search-products?${currentQuery}`);
      const data = await res.json();

      const userIds = data.map((product: Product) => product.userId);
      if (userIds.length !== 0) {
        const userRes = await fetch("/api/users-public-data", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ids: userIds }),
        });
        const users = await userRes.json();
        setUsersInfo(users);
      }

      setProducts(data);
    };

    fetchProducts();
  }, [queryString]);

  useEffect(() => {
    setSelectedProducts(user ? user.selectedProducts : []);
  }, [user]);

  const addRemoveFavorites = async (
    event: React.MouseEvent,
    productId: string
  ) => {
    event.stopPropagation();

    const updated = await toggleFavorite(productId, selectedProducts);
    if (!updated) return;

    setSelectedProducts(updated);
    refreshUser();
  };

  const handleConditionChange = () => {
    if (!condition) {
      setCondition("New");
      return;
    }

    if (condition === "New") {
      setCondition("Used");
      return;
    }

    if (condition === "Used") {
      setCondition(null);
    }
  };
  const handleTradeChange = () => {
    if (isTradePossible === null) {
      setTradePossible(true);
    } else if (isTradePossible === true) {
      setTradePossible(false);
    } else {
      setTradePossible(null);
    }
  };

  const extraCategory = {
    id: "Any",
    svgId: null,
    href: null,
    name: "Any",
  };
  const newCategories = [extraCategory, ...categories];
  return (
    <div className="searchAds-container gap-3">
      <SearchBar
        parentLocation={location ? location : ""}
        parentSearchTerm={name ? name : ""}
        onSearch={({ name, location }) => {
          setName(name || null);
          setLocation(location || null);
        }}
      />
      <div className="search-filters py-2 px-2 ">
        <div className="d-flex flex-wrap justify-content-start gap-3">
          <div className="filter-item d-flex gap-3 flex-wrap align-items-center">
            <p className="m-0">Price</p>

            <div className="d-flex gap-3 align-items-center">
              <span style={{ width: "30px" }}>Min:</span>
              <input
                className="price-input rounded-1"
                name="minPrice"
                type="number"
                onBlur={(e) =>
                  setPriceMin(e.target.value ? Number(e.target.value) : null)
                }
              />
            </div>

            <div className="d-flex gap-3 align-items-center">
              <span style={{ width: "30px" }}>Max:</span>
              <input
                className="price-input rounded-1"
                name="maxPrice"
                type="number"
                onBlur={(e) =>
                  setPriceMax(e.target.value ? Number(e.target.value) : null)
                }
              />
            </div>
          </div>
          <div
            className="filter-item"
            onClick={() => setCategorySelectActive(true)}
          >
            {category && categoryIcon ? (
              <p className="d-flex align-items-center gap-1 m-0">
                {category}
                <svg className="icon icon-warning">
                  <use xlinkHref={categoryIcon}></use>
                </svg>
              </p>
            ) : (
              "Any"
            )}
          </div>
          {categorySelectActive && (
            <div className="category-Section-container">
              <div className="category-Section">
                <ul>
                  {newCategories.map(({ id, svgId, href, name }) => (
                    <li
                      key={svgId}
                      id={id}
                      onClick={() => {
                        setCategorySelectActive(false);
                        setCategory(id);
                        setCategoryIcon(href);
                      }}
                    >
                      <svg id={svgId} width="24" height="24">
                        <use xlinkHref={href}></use>
                      </svg>
                      <p>{name}</p>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
          <div className="filter-item" onClick={handleConditionChange}>
            {condition ?? "Any state"}
          </div>
          <div className="filter-item" onClick={handleTradeChange}>
            {isTradePossible === true
              ? "Trade possible"
              : isTradePossible === false
              ? "Without trade"
              : "All variants"}
          </div>
        </div>
      </div>
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
        <div className="row row-cols-1   gx-1 gy-1">
          {products.map((product) => (
            <div className="col">
              <div
                onClick={() => setOpenedProduct(product)}
                key={product.productId}
                className={`product-search-type gap-3 w-100`}
              >
                <img src={`${product.images?.[0]}`} alt={product.name} />
                <div className="product-info ">
                  <p className="name">{product.name}</p>
                  <div className="product-search-type-description">
                    {product.description}
                  </div>

                  <ul className="list-unstyled">
                    <li className="product-location">{product.location}</li>
                    <li className="release-date">
                      {product.formattedDateTime}
                    </li>
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
    </div>
  );
};

export default SearchAds;
