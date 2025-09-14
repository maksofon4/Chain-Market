import React, { useState, useEffect } from "react";
import { cities } from "clientSideInfo";
import "./SearchBar.css";

interface SearchBarProps {
  onSearch: (data: { name: string | null; location: string | null }) => void;
  parentSearchTerm: string;
  parentLocation: string;
}

const SearchBar: React.FC<SearchBarProps> = ({
  onSearch,
  parentSearchTerm,
  parentLocation,
}) => {
  // State for managing search input and location input
  const [searchTerm, setSearchTerm] = useState(parentSearchTerm ?? "");
  const [location, setLocation] = useState(parentLocation ?? "");
  const [suggestions, setSuggestions] = useState<string[] | []>([]);

  useEffect(() => {
    setSearchTerm(parentSearchTerm ?? "");
  }, [parentSearchTerm]);

  useEffect(() => {
    setLocation(parentLocation ?? "");
  }, [parentLocation]);

  // Handle search input change
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  // Handle location input change
  const handleLocationChange = (e) => {
    const inputValue = e.target.value;
    setLocation(inputValue);

    // Filter cities based on user input
    if (inputValue.trim().length > 0) {
      const filteredCities = cities.filter((city) =>
        city.toLowerCase().startsWith(inputValue.toLowerCase())
      );
      setSuggestions(filteredCities);
    } else {
      setSuggestions([]);
    }
  };

  // Handle suggestion click (select a city)
  const handleSuggestionClick = (city) => {
    setLocation(city);
    setSuggestions([]); // Clear the suggestions
  };

  // Handle search button click
  const handleSearchClick = () => {
    onSearch({ name: searchTerm, location: location });
  };

  return (
    <div className="search-bar">
      <div className="searchInput px-2">
        <svg className="icon icon-search">
          <use xlinkHref="/symbol-defs.svg#icon-search"></use>
        </svg>
        <input
          type="text"
          id="searchInput"
          value={searchTerm}
          onChange={handleSearchChange}
          placeholder="What are you looking for?"
        />
      </div>

      <div className="location-input px-2">
        <svg className="icon icon-location">
          <use xlinkHref="/symbol-defs.svg#icon-location"></use>
        </svg>
        <input
          type="text"
          value={location}
          onChange={handleLocationChange}
          placeholder="Location"
        />
        {suggestions.length > 0 && (
          <div className="suggestions">
            {suggestions.map((city, index) => (
              <p
                key={index}
                onClick={() => {
                  handleSuggestionClick(city);
                }}
              >
                {city}
              </p>
            ))}
          </div>
        )}
      </div>

      <button onClick={handleSearchClick}>Search</button>
    </div>
  );
};

export default SearchBar;
