import React from "react";
import "./mainPage.css";
import Categories from "./Categories/SectionCategories.js";
import SearchBar from "./SearchBar/SearchBar.js";
import ProductList from "./ProductList/productList";

function MainPage() {
  return (
    <div className="main-page">
      <SearchBar />
      <Categories />
      <ProductList />
    </div>
  );
}

export default MainPage;
