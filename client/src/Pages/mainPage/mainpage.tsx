import React, { useState } from "react";
import "./mainPage.css";
import Categories from "./Categories/SectionCategories";
import SearchBar from "../../Components/SearchBar/SearchBar";
import ProductList from "./ProductList/productList";
import { useNavigate } from "react-router-dom";

function MainPage() {
  const navigate = useNavigate();

  const handleSearch = (searchTerm, location) => {
    const params = new URLSearchParams();

    if (searchTerm && searchTerm.trim()) {
      params.append("name", searchTerm);
    }
    if (location && location.trim()) {
      params.append("location", location);
    }

    navigate(`/search-ads?${params.toString()}`);
  };

  return (
    <div className="main-page">
      <SearchBar
        parentLocation=""
        parentSearchTerm=""
        onSearch={({ name, location }) => {
          handleSearch(name, location);
        }}
      />
      <Categories />
      <ProductList />
    </div>
  );
}
export default MainPage;
