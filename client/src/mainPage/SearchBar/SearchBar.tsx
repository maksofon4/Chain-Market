import React, { useState } from "react";
import { cities } from "clientSideInfo";
import "./SearchBar.css";

interface SearchBarProps {
  onSearchChange: (value: string) => void;
  onLocationChange: (value: string) => void;
  onSearch: () => void;
}

const SearchBar: React.FC<SearchBarProps> = ({
  onSearchChange,
  onLocationChange,
  onSearch,
}) => {
  // State for managing search input and location input
  const [searchTerm, setSearchTerm] = useState("");
  const [location, setLocation] = useState("");
  const [suggestions, setSuggestions] = useState<string[] | []>([]);

  // Handle search input change
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    onSearchChange(e.target.value);
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
      onLocationChange("");
      setSuggestions([]);
    }
  };

  // Handle suggestion click (select a city)
  const handleSuggestionClick = (city) => {
    onLocationChange(city);
    setLocation(city); // Set the location input field to the selected city
    setSuggestions([]); // Clear the suggestions
  };

  // Handle search button click
  const handleSearchClick = () => {
    onSearch();
  };

  return (
    <div className="search-bar">
      <div className="searchInput">
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

      <div className="location-input">
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
              <p key={index} onClick={() => handleSuggestionClick(city)}>
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
