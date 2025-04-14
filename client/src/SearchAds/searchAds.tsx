import SearchBar from "mainPage/SearchBar/SearchBar";
import "./searchAds.css";
import { useState } from "react";
const SearchAds: React.FC = () => {
  const [category, setCategory] = useState<string | null>(null);
  const [categorySelectActive, setCategorySelectActive] = useState<
    boolean | null
  >(null);
  const [categoryIcon, setCategoryIcon] = useState<string | null>(null);
  const categories = [
    {
      id: "Family",
      svgId: "icon-pencil2",
      href: "categories-defs.svg#icon-pencil2",
      name: "Family",
    },
    {
      id: "Paint",
      svgId: "icon-paint-format",
      href: "categories-defs.svg#icon-paint-format",
      name: "Paint",
    },
    {
      id: "Media",
      svgId: "icon-image",
      href: "categories-defs.svg#icon-image",
      name: "Media",
    },
    {
      id: "Headset",
      svgId: "icon-headphones",
      href: "categories-defs.svg#icon-headphones",
      name: "Headset",
    },
    {
      id: "Books",
      svgId: "icon-book",
      href: "categories-defs.svg#icon-book",
      name: "Books",
    },
    {
      id: "Work",
      svgId: "icon-profile",
      href: "categories-defs.svg#icon-profile",
      name: "Work",
    },
    {
      id: "PC",
      svgId: "icon-display",
      href: "categories-defs.svg#icon-display",
      name: "PC",
    },
    {
      id: "Phones",
      svgId: "icon-mobile",
      href: "categories-defs.svg#icon-mobile",
      name: "Phones",
    },
    {
      id: "TV",
      svgId: "icon-tv",
      href: "categories-defs.svg#icon-tv",
      name: "TV",
    },
    {
      id: "Tools",
      svgId: "icon-wrench",
      href: "categories-defs.svg#icon-wrench",
      name: "Tools",
    },
    {
      id: "Medicine",
      svgId: "icon-aid-kit",
      href: "categories-defs.svg#icon-aid-kit",
      name: "Medicine",
    },
    {
      id: "Cutlery",
      svgId: "icon-spoon-knife",
      href: "categories-defs.svg#icon-spoon-knife",
      name: "Cutlery",
    },
    {
      id: "Garden",
      svgId: "icon-leaf",
      href: "categories-defs.svg#icon-leaf",
      name: "Garden",
    },
    {
      id: "Fuel",
      svgId: "icon-fire",
      href: "categories-defs.svg#icon-fire",
      name: "Fuel",
    },
    {
      id: "Vehicles",
      svgId: "icon-truck",
      href: "categories-defs.svg#icon-truck",
      name: "Vehicles",
    },
    {
      id: "Toys",
      svgId: "icon-reddit",
      href: "categories-defs.svg#icon-reddit",
      name: "Toys",
    },
  ];

  const extraCategory = {
    id: "Any",
    svgId: null,
    href: null,
    name: "Any",
  };
  const newCategories = [extraCategory, ...categories];
  return (
    <div className="searchAds-container">
      <SearchBar
        onSearchChange={(data) => {}}
        onLocationChange={(data) => {}}
        onSearch={() => {}}
      />
      <div className="search-filters">
        <div className="filter-item-container">
          <div
            className="filter-item"
            onClick={() => setCategorySelectActive(true)}
          >
            {category && categoryIcon ? (
              <p style={{ display: "flex", alignItems: "center", margin: 0 }}>
                {category}{" "}
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
        </div>
      </div>
      <div className="ads-list"></div>
    </div>
  );
};

export default SearchAds;
