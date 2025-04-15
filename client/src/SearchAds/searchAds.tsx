import SearchBar from "mainPage/SearchBar/SearchBar";
import "./searchAds.css";
import { useState } from "react";
import { categories } from "clientSideInfo";
const SearchAds: React.FC = () => {
  const [category, setCategory] = useState<string | null>(null);
  const [categorySelectActive, setCategorySelectActive] = useState<
    boolean | null
  >(null);
  const [categoryIcon, setCategoryIcon] = useState<string | null>(null);

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
