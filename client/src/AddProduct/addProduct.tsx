import React, { useState, useEffect, useRef, use } from "react";
import ProductImageUploader from "Functions/productImgCroper";
import { ProductModal } from "Functions/productInfo";
import "./addProudct.css";

const AddProduct = () => {
  interface SessionInfo {
    userId: string;
    username: string;
    email: string;
    profilePhoto: string;
    pinnedChats: string[];
    selectedProducts: string[];
  }
  interface Product {
    productId: string;
    userId: string;
    name: string;
    category: string;
    description: string;
    location: string;
    priceUSD: string;
    condition: string;
    tradePossible: boolean;
    contactDetails: {
      email: string;
      phoneNumber: string;
    };
    images: string[];
    formattedDateTime: string;
  }

  const [sessionInfo, setSessionInfo] = useState<SessionInfo | null>(null);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [nameSymbols, setNameSymbols] = useState<number>();
  const [descriptionSymbols, setDescriptionSymbols] = useState<number>();
  const [activeInput, setActiveInput] = useState<string | undefined>();
  const [customSelectActive, setCustomSelectActive] = useState<boolean>(false);
  const [productCategory, setProductCategory] = useState<string | undefined>(
    undefined
  );
  const [categoryIcon, setCategoryIcon] = useState<string | undefined>(
    undefined
  );
  const [openedProduct, setOpenedProduct] = useState<Product | null>(null);
  const [productName, setProductName] = useState<string | undefined>(undefined);
  const [descriptionText, setDescriptionText] = useState<string | undefined>(
    undefined
  );
  const [location, setLocation] = useState<string | undefined>(undefined);
  const [price, setPrice] = useState<string | undefined>(undefined);
  const [condition, setCondition] = useState<string | undefined>(undefined);
  const [tradePossibleCondition, setTradeCondition] = useState<boolean>(false);

  const [email, setEmail] = useState<string | undefined>(undefined);
  const [phoneNumber, setPhoneNumber] = useState<string | undefined>(undefined);

  const [images, setImages] = useState<string[]>([]);
  const [time, setTime] = useState<string>("");

  const [customActiveAlert, setCustomActiveAlert] = useState<
    string | undefined
  >();
  const [alertText, setAlertText] = useState<string | undefined>();

  const handleImageCropped = (croppedImg: string | null, index: number) => {
    setImages((prev) => {
      const newImages = [...prev];
      newImages[index] = croppedImg; // Either update or set null
      return newImages;
    });
  };

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
  const updateTime = () => {
    const date = new Date();
    const formattedDate = date.toLocaleDateString("en-GB", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    });
    setTime(formattedDate);
  };
  const userdata = [
    {
      userId: sessionInfo?.userId,
      username: sessionInfo?.username,
      profilePhoto: sessionInfo?.profilePhoto,
    },
  ];

  const validateProduct = () => {
    const filteredImgs = images.filter((img) => img !== null);
    const isFilteredImgsValid = filteredImgs.length > 0;
    const isNameValid = productName && productName.trim().length > 9;
    const isDescriptionValid =
      descriptionText && descriptionText?.trim().length > 49;
    const isLocationValid = location && cities.includes(location.trim());
    const validatePrice = (price: string) => {
      if (!price) return false;
      const normalizedPrice = price.replace(/\s/g, "").trim(); // Remove spaces
      return /^\d+$/.test(normalizedPrice); // Check if only digits remain
    };

    const isPhoneNumberValid = (phone: string) => /^\d+$/.test(phone.trim());

    const isContactDetailsValid =
      email && email.trim().length > 3 && phoneNumber;
    // if (!sessionInfo) return showErrorAlert("network");
    if (!isNameValid) return showErrorAlert("invalidName");
    if (!productCategory) return showErrorAlert("invalidCategory");
    if (!isFilteredImgsValid) return showErrorAlert("invalidImages");
    if (!isDescriptionValid) return showErrorAlert("invalidDescription");
    if (!condition) return showErrorAlert("invalidStatus");
    if (!price || !validatePrice(price)) return showErrorAlert("invalidPrice");
    if (!isLocationValid) return showErrorAlert("invalidLocation");
    if (!isContactDetailsValid) return showErrorAlert("invalidContactDetails");
    if (!isPhoneNumberValid(phoneNumber))
      return showErrorAlert("invalidPhoneNumber");
  };

  const showProductPreview = () => {
    validateProduct();
    updateTime();
    const filteredImgs = images.filter((img) => img !== null);
    const product: Product = {
      productId: "none",
      userId: "fff45a17-11e1-4b9a-98d8-7d74a28e2028",
      name: productName!,
      category: productCategory!,
      description: descriptionText!,
      location: location!,
      priceUSD: price!,
      condition: condition!,
      tradePossible: tradePossibleCondition!,
      contactDetails: {
        email: email!,
        phoneNumber: phoneNumber!,
      },
      images: filteredImgs,
      formattedDateTime: time,
    };

    setOpenedProduct(product);
  };

  const uploadProduct = async () => {
    validateProduct();
    updateTime();
    const filteredImgs = images.filter((img) => img !== null);
    const contactDetails = {
      email: email!,
      phoneNumber: phoneNumber!,
    };

    const formData = new FormData();
    formData.append("name", productName!); // Correct value for name
    formData.append("category", productCategory!); // Correct value for category
    formData.append("description", descriptionText!); // Correct value for description
    formData.append("location", location!); // Correct value for location
    formData.append("priceUSD", price!); // Correct value for price
    formData.append("condition", condition!); // Correct value for condition
    formData.append("tradePossible", JSON.stringify(tradePossibleCondition)); // Correct value for tradePossible
    formData.append("userContactDetails", JSON.stringify(contactDetails)); // Correct contactDetails
    formData.append("formattedDateTime", time); // Correctly append formattedDateTime

    for await (const img of filteredImgs) {
      const base64Response = await fetch(img);
      const blob = await base64Response.blob();

      formData.append("images", blob);
    }

    try {
      const response = await fetch("/api/add-product", {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        showSuccessAlert();
      } else {
        alert("Failed to upload product.");
      }
    } catch (error) {
      console.error("Error uploading product:", error);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const sessionReq = await fetch(`/api/session-info`);

        if (!sessionReq.ok) throw new Error("Failed to fetch chat data");
        const sessionInfo = await sessionReq.json();

        setSessionInfo(sessionInfo);
      } catch (error) {
        console.error("Error fetching chat data:", error);
      }
    };

    fetchData();
  }, []);

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

  const showSuccessAlert = () => {
    setCustomActiveAlert("success");
  };

  const showErrorAlert = (errorType: string) => {
    setCustomActiveAlert("error");

    let errorMessage = "";

    switch (errorType) {
      case "network":
        errorMessage = "Network error. Please check your connection."; //   userId: sessionInfo?.userId
        break;
      case "server":
        errorMessage = "Server error. Try again later."; //Bad request or server-side issue
        break;
      case "invalidName":
        errorMessage = "Invalid product name. Please check the form."; //   name: productName
        break;
      case "invalidCategory":
        errorMessage =
          "You haven't specified the product category, perform this action first."; //   category: productCategory
        break;
      case "invalidDescription":
        errorMessage = "The description is in a lack of symbols or empty"; //   description: descriptionText
        break;
      case "invalidLocation":
        errorMessage =
          "The location field is empty or consists of non-existent city or typo"; //   location: location
        break;
      case "invalidPrice":
        errorMessage = "The price field is empty or consist typo"; //   priceUSD: price
        break;
      case "invalidStatus":
        errorMessage = `The product status: "new or used" has to be specified`; //   condition: condition
        break;
      case "invalidContactDetails":
        errorMessage = `Your contact details have to be specified and will be visible for all users`; //   contactDetails
        break;
      case "invalidPhoneNumber":
        errorMessage = `Your phone number is empty or has a typo`; //   contactDetails
        break;
      case "invalidImages":
        errorMessage = `The product doesn't have images. At least add one.`; //   images: filteredImgs
        break;
      default:
        errorMessage = "An unexpected error occurred.";
    }

    setAlertText(errorMessage);
    return false;
  };

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

  return (
    <div className="add-product-parent">
      {openedProduct && sessionInfo && (
        <ProductModal
          uploadedImgs={false}
          allUsersData={userdata}
          sessionInfo={sessionInfo}
          product={openedProduct}
          onClose={() => setOpenedProduct(null)}
        />
      )}
      {customSelectActive && (
        <div className="category-Section-container">
          <div className="category-Section">
            <ul>
              {categories.map(({ id, svgId, href, name }) => (
                <li
                  key={svgId}
                  id={id}
                  onClick={() => {
                    setCustomSelectActive(false);
                    setProductCategory(id);
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

      {customActiveAlert === "error" && alertText && (
        <div className="errorAlert">
          <h1>
            <svg className="icon icon-warning">
              <use xlinkHref="/symbol-defs.svg#icon-warning"></use>
            </svg>
            Error
          </h1>
          <p> {alertText}</p>
          <div className="wrapper">
            <button onClick={() => setCustomActiveAlert(undefined)}>
              Close
            </button>
          </div>
        </div>
      )}
      {customActiveAlert === "success" && (
        <div className="successMessage">
          <h1>
            <svg className="icon icon-checkmark">
              <use xlinkHref="/symbol-defs.svg#icon-checkmark"></use>
            </svg>
            Success
          </h1>
          <p>Your product has been uploaded successfully!</p>
          <div className="wrapper">
            <button
              className="successCloseButton"
              onClick={() => setCustomActiveAlert(undefined)}
            >
              Close
            </button>
          </div>
        </div>
      )}

      <div className="container">
        <h1 className="majorHeading">Create a New Announcements</h1>
        <div className="divider">
          <h1 className="majorHeading">Ad name</h1>
          <div id="ad-name">
            <form>
              <input
                onFocus={() => setActiveInput("ad-name")}
                onBlur={() => setActiveInput(undefined)}
                style={
                  activeInput !== "ad-name" &&
                  nameSymbols !== undefined &&
                  nameSymbols < 10
                    ? { boxShadow: "inset 0px 0px 5px red" }
                    : {}
                }
                type="text"
                placeholder="For example, used adjustable wrench"
                maxLength={50}
                onChange={(e) => {
                  setNameSymbols(e.target.value.trim().length);
                  setProductName(e.target.value);
                }}
              />

              {activeInput !== "ad-name" &&
                nameSymbols !== undefined &&
                nameSymbols < 10 && (
                  <p className="error-message">
                    Name should have at least 10 characters!
                  </p>
                )}
              <p id="ad-name-text-counter">
                {nameSymbols ? nameSymbols : 0} / 50
              </p>
            </form>
            <div
              className="custom-select"
              onClick={() => setCustomSelectActive(true)}
              style={
                productCategory && categoryIcon
                  ? {
                      height: "100px",
                      width: "fit-content",
                    }
                  : {}
              }
            >
              {!productCategory && !categoryIcon ? (
                <p className="custom-select-placeholder">Choose category</p>
              ) : (
                <p className="custom-select-placeholder">
                  <svg width="24" height="24">
                    <use xlinkHref={categoryIcon}></use>
                  </svg>
                  {productCategory}
                </p>
              )}

              {!productCategory && !categoryIcon && (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  id="icon-arrowdown"
                >
                  <use xlinkHref="/symbol-defs.svg#icon-arrowdown"></use>
                </svg>
              )}
            </div>
          </div>
        </div>
        <div className="divider2">
          <h1 className="majorHeading">Photo</h1>
          <h3>The first photo will be on the cover of the ad</h3>

          <div className="image-list">
            <ProductImageUploader
              key={0}
              onImageCropped={(img) => handleImageCropped(img, 0)}
            />
            <ProductImageUploader
              key={1}
              onImageCropped={(img) => handleImageCropped(img, 1)}
            />
            <ProductImageUploader
              key={2}
              onImageCropped={(img) => handleImageCropped(img, 2)}
            />
            <ProductImageUploader
              key={3}
              onImageCropped={(img) => handleImageCropped(img, 3)}
            />
            <ProductImageUploader
              key={4}
              onImageCropped={(img) => handleImageCropped(img, 4)}
            />
            <ProductImageUploader
              key={5}
              onImageCropped={(img) => handleImageCropped(img, 5)}
            />
            <ProductImageUploader
              key={6}
              onImageCropped={(img) => handleImageCropped(img, 6)}
            />
            <ProductImageUploader
              key={7}
              onImageCropped={(img) => handleImageCropped(img, 7)}
            />
          </div>
        </div>
        <div className="divider3">
          <h1 className="majorHeading">Description</h1>
          <div className="text-field">
            <form>
              <textarea
                style={
                  activeInput !== "description" &&
                  descriptionSymbols &&
                  descriptionSymbols < 40
                    ? { boxShadow: "inset 0px 0px 5px red" }
                    : {}
                }
                className="text-field-input"
                placeholder="Write essential information about the product you are going to upload"
                maxLength={9000}
                onFocus={() => setActiveInput("description")}
                onBlur={() => setActiveInput(undefined)}
                onChange={(e) => {
                  setDescriptionSymbols(e.target.value.trim().length);
                  setDescriptionText(e.target.value);
                }}
              ></textarea>
            </form>
            {activeInput !== "description" &&
            descriptionSymbols &&
            descriptionSymbols < 40 ? (
              <p className="Description-error-message">
                Enter at least 40 characters!
              </p>
            ) : (
              <p className="minsymb">Enter at least 40 characters</p>
            )}
            <p className="maxsymb">
              {descriptionSymbols ? descriptionSymbols : 0} / 9000
            </p>
          </div>
        </div>
        <div className="add-product-price">
          <h1 className="majorHeading">Customer details</h1>
          <div className="add-product-price-container">
            <div className="productStatus">
              <div className="checkbox">
                <label>
                  <p>New</p>
                  <span id="checkboxContainer">
                    <input
                      id="newCheckbox"
                      type="checkbox"
                      checked={condition === "New"}
                      onChange={() => setCondition("New")}
                    />
                    <span id="checkboxSpan"></span>
                  </span>
                </label>
              </div>
              <div className="checkbox">
                <label>
                  <p>Used</p>
                  <span id="checkboxContainer">
                    <input
                      id="newCheckbox"
                      type="checkbox"
                      checked={condition === "Used"}
                      onChange={() => setCondition("Used")}
                    />
                    <span id="checkboxSpan"></span>
                  </span>
                </label>
              </div>
            </div>
            <div className="togglecheckbox">
              <label htmlFor="checkboxToggle">
                <p>Trade is possible</p>
              </label>
              <input
                type="checkbox"
                id="checkboxToggle"
                onChange={(e) =>
                  setTradeCondition(e.target.checked ? true : false)
                }
              />
              <label htmlFor="checkboxToggle" className="togglebutton"></label>
            </div>
            <div className="priceContainer">
              <div className="priceInputContainer">
                <p>Price in USD</p>
                <input
                  className="priceInput"
                  type="text"
                  placeholder="0.00"
                  onChange={(e) => setPrice(e.target.value)}
                />
              </div>
            </div>
          </div>
        </div>
        <div className="divider4">
          <h1 className="majorHeading">Location</h1>
          <form className="location">
            <input
              value={location ? location : ""}
              onChange={(e) => {
                setLocation(e.target.value);
                handleLocationChange(e);
              }}
              type="text"
              placeholder=""
            />
            {suggestions.length > 0 && (
              <div id="suggestions">
                {suggestions.map((city, index) => (
                  <p key={index} onClick={() => handleSuggestionClick(city)}>
                    {city}
                  </p>
                ))}
              </div>
            )}
          </form>
        </div>
        <div className="divider5">
          <h1 className="majorHeading">Your contact details</h1>
          <form>
            <p>Email</p>
            <input
              id="email"
              type="text"
              placeholder=""
              onChange={(e) => setEmail(e.target.value)}
            />
            <p>Phone number</p>
            <input
              type="text"
              placeholder=""
              onChange={(e) => setPhoneNumber(e.target.value)}
            />
          </form>
        </div>
        <div className="divider6">
          <button id="prew-button" onClick={showProductPreview}>
            Preview
          </button>
          <button id="upload-button" onClick={() => uploadProduct()}>
            Upload
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddProduct;
