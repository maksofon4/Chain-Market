import React, { useState } from "react";
import "./mainPage.css";
import Categories from "./Categories/SectionCategories.js";
import SearchBar from "./SearchBar/SearchBar";
import ProductList from "./ProductList/productList";
import { useNavigate } from "react-router-dom";

function MainPage() {
  const [searchTerm, setTerm] = useState<string | null>(null);
  const [location, setLocation] = useState<string | null>(null);

  const navigate = useNavigate();

  const handleSearch = () => {
    if (!searchTerm || !location) return;
    if (searchTerm.trim() || location.trim()) {
      navigate(
        `/results?query=${encodeURIComponent(
          searchTerm
        )}&location=${encodeURIComponent(location)}`
      );
    }
  };
  return (
    <div className="main-page">
      <SearchBar
        onSearchChange={(data) => setTerm(data)}
        onLocationChange={(data) => setLocation(data)}
        onSearch={() => handleSearch()}
      />
      <Categories />
      <ProductList />
    </div>
  );
}
export default MainPage;
