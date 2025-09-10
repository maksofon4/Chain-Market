import React, { useState, useEffect, useContext } from "react";
import { SessionContext } from "Components/GlobalData/GlobalData";
import ProductImageUploader from "Components/ProductImageUploader/ProductImageUploader";
import { ProductModal } from "Components/ProductModal/ProductModal";
import { categories, cities } from "clientSideInfo";
import "./addProudct.css";
import { Product } from "models/product";
import { validateProduct } from "./validateProduct";
import Alert from "./alert";
import { useNavigate } from "react-router-dom";

const AddProduct = () => {
  const navigate = useNavigate();
  const [status, setStatus] = useState<string | null>(null);
  const sessionInfo = useContext(SessionContext);
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

  const handleImageCropped = (croppedImg: string | null, index: number) => {
    setImages((prev) => {
      const newImages = [...prev];
      newImages[index] = croppedImg; // Either update or set null
      return newImages;
    });
  };

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
      userId: sessionInfo?.user.userId,
      username: sessionInfo?.user.username,
      profilePhoto: sessionInfo?.user.profilePhoto,
    },
  ];

  const productData = {
    images: images,
    productName: productName,
    description: descriptionText,
    location: location,
    price: price,
    contactDetails: {
      email: email,
      phoneNumber: phoneNumber,
    },
    productCategory: productCategory,
    condition: condition,
    sessionInfo: sessionInfo,
  };

  const showProductPreview = () => {
    const vlidateResult = validateProduct(productData);

    if (vlidateResult !== true) {
      showErrorAlert(vlidateResult);
      return;
    }
    updateTime();
    const filteredImgs = images.filter((img) => img !== null);
    const product: Product = {
      productId: "none",
      userId: sessionInfo?.user.userId!,
      name: productName!,
      category: productCategory!,
      description: descriptionText!,
      location: location!,
      price: price!,
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
    const vlidateResult = validateProduct(productData);

    if (vlidateResult !== true) {
      showErrorAlert(vlidateResult);
      return;
    }
    updateTime();
    const filteredImgs = images.filter((img) => img !== null);

    const formData = new FormData();
    formData.append("type", "product");
    formData.append("name", productName!); // Correct value for name
    formData.append("category", productCategory!); // Correct value for category
    formData.append("description", descriptionText!); // Correct value for description
    formData.append("location", location!); // Correct value for location
    formData.append("price", price!); // Correct value for price
    formData.append("condition", condition!); // Correct value for condition
    formData.append("tradePossible", JSON.stringify(tradePossibleCondition)); // Correct value for tradePossible
    formData.append("email", email);
    formData.append("phoneNumber", phoneNumber);
    formData.append("formattedDateTime", time); // Correctly append formattedDateTime

    for await (const img of filteredImgs) {
      const base64Response = await fetch(img);
      const blob = await base64Response.blob();

      formData.append("images", blob);
    }

    try {
      const response = await fetch("/api/upload-product", {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        showSuccessAlert();
      } else {
        showErrorAlert("Unexpected");
      }
    } catch (error) {
      console.error("Error uploading product:", error);
    }
  };

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
    setStatus("success");
  };
  const showErrorAlert = (errorType: string) => {
    setStatus(errorType);
  };

  return (
    <div className="add-product-parent">
      <Alert
        status={status}
        onClose={() => {
          setStatus(null);
          if (status === "success") navigate("/");
        }}
      />
      {openedProduct && sessionInfo && (
        <ProductModal
          uploadedImgs={false}
          allUsersData={userdata}
          sessionInfo={sessionInfo.user}
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
                <p className="custom-select-placeholder gap-1">
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

          <div className="row row-cols-2 row-cols-sm-2 row-cols-md-3 row-cols-lg-4 gx-1 gy-1">
            <div className="col">
              <ProductImageUploader
                key={0}
                inputId={0}
                onImageCropped={(data) => {
                  if (data && data.croppedDataUrl) {
                    handleImageCropped(data.croppedDataUrl, 0);
                  } else {
                    handleImageCropped(null, 0);
                  }
                }}
              />
            </div>
            <div className="col">
              <ProductImageUploader
                key={1}
                inputId={1}
                onImageCropped={(data) => {
                  if (data && data.croppedDataUrl) {
                    handleImageCropped(data.croppedDataUrl, 1);
                  } else {
                    handleImageCropped(null, 1);
                  }
                }}
              />
            </div>
            <div className="col">
              <ProductImageUploader
                key={2}
                inputId={2}
                onImageCropped={(data) => {
                  if (data && data.croppedDataUrl) {
                    handleImageCropped(data.croppedDataUrl, 2);
                  } else {
                    handleImageCropped(null, 2);
                  }
                }}
              />
            </div>
            <div className="col">
              <ProductImageUploader
                key={3}
                inputId={3}
                onImageCropped={(data) => {
                  if (data && data.croppedDataUrl) {
                    handleImageCropped(data.croppedDataUrl, 3);
                  } else {
                    handleImageCropped(null, 3);
                  }
                }}
              />
            </div>
            <div className="col">
              <ProductImageUploader
                inputId={4}
                onImageCropped={(data) => {
                  if (data && data.croppedDataUrl) {
                    handleImageCropped(data.croppedDataUrl, 4);
                  } else {
                    handleImageCropped(null, 4);
                  }
                }}
              />
            </div>
            <div className="col">
              <ProductImageUploader
                inputId={5}
                onImageCropped={(data) => {
                  if (data && data.croppedDataUrl) {
                    handleImageCropped(data.croppedDataUrl, 5);
                  } else {
                    handleImageCropped(null, 5);
                  }
                }}
              />
            </div>
            <div className="col">
              <ProductImageUploader
                inputId={6}
                onImageCropped={(data) => {
                  if (data && data.croppedDataUrl) {
                    handleImageCropped(data.croppedDataUrl, 6);
                  } else {
                    handleImageCropped(null, 6);
                  }
                }}
              />
            </div>
            <div className="col">
              <ProductImageUploader
                inputId={7}
                onImageCropped={(data) => {
                  if (data && data.croppedDataUrl) {
                    handleImageCropped(data.croppedDataUrl, 7);
                  } else {
                    handleImageCropped(null, 7);
                  }
                }}
              />
            </div>
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
