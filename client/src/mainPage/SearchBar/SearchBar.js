import React, { useState } from "react";
import "./SearchBar.css";

function SearchBar() {
  // State for managing search input and location input
  const [searchTerm, setSearchTerm] = useState("");
  const [location, setLocation] = useState("");
  const [suggestions, setSuggestions] = useState([]);

  const cities = [
    "Kyiv",
    "Kharkiv",
    "Odesa",
    "Dnipro",
    "Lviv",
    "Kryvyi Rih",
    "Mykolaiv",
    "Mariupol",
    "Sevastopol",
    "Luhansk",
    "Vinnytsia",
    "Zaporizhzhia",
    "Simferopol",
    "Kherson",
    "Poltava",
    "Chernihiv",
    "Cherkasy",
    "Zhytomyr",
    "Sumy",
    "Rivne",
    "Ivano-Frankivsk",
    "Ternopil",
    "Chernivtsi",
    "Lutsk",
    "Kropyvnytskyi",
    "Uzhhorod",
    "Khmelnytskyi",
    "Kremenchuk",
    "Bila Tserkva",
    "Melitopol",
    "Nikopol",
    "Sloviansk",
    "Brovary",
    "Berdiansk",
    "Pavlohrad",
    "Kamianets-Podilskyi",
    "Alchevsk",
    "Yevpatoria",
    "Konotop",
    "Uman",
    "Shostka",
    "Oleksandriia",
    "Mukachevo",
    "Kostopil",
    "Netishyn",
    "Enerhodar",
    "Horlivka",
    "Kadiivka",
    "Druzhkivka",
    "Lysychansk",
    "Rubizhne",
    "Bakhmut",
    "Kramatorsk",
    "Pokrovsk",
    "Sieverodonetsk",
    "Toretsk",
    "Dniprorudne",
    "Nova Kakhovka",
    "Pryluky",
    "Smila",
    "Fastiv",
    "Obukhiv",
    "Yalta",
    "Boryspil",
    "Irpin",
    "Boyarka",
    "Vyshneve",
    "Chornobyl",
    "Slavutych",
    "Borodianka",
    "Vyshhorod",
    "Vasylkiv",
    "Bilhorod-Dnistrovskyi",
    "Yuzhne",
    "Izmail",
    "Chornomorsk",
    "Reni",
    "Berezan",
    "Boryslav",
    "Drohobych",
    "Stryi",
    "Truskavets",
    "Novovolynsk",
    "Chervonohrad",
    "Volodymyr",
    "Drohobych",
    "Zhovkva",
    "Zhytomyr",
    "Zolochiv",
    "Zvenyhorodka",
  ];

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
    setLocation(city); // Set the location input field to the selected city
    setSuggestions([]); // Clear the suggestions
  };

  // Handle search button click
  const handleSearchClick = () => {
    console.log("Searching for:", searchTerm, "in location:", location);
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
}

export default SearchBar;
