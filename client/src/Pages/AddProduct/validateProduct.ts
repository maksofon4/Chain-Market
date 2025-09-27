import { cities } from "clientSideInfo";

export const validateProduct = (product) => {
  const {
    images,
    productName,
    description,
    location,
    price,
    contactDetails,
    productCategory,
    condition,
    sessionInfo,
  } = product;

  const filteredImgs = images.filter((img) => img !== null);
  const isFilteredImgsValid = filteredImgs.length > 0;
  const isNameValid = productName && productName.trim().length > 9;
  const isDescriptionValid = description && description?.trim().length > 39;
  const isLocationValid = location && cities.includes(location.trim());
  const validatePrice = (price: string) => {
    if (!price) return false;
    const normalizedPrice = price.replace(/\s/g, "").trim(); // Remove spaces
    return /^\d+$/.test(normalizedPrice); // Check if only digits remain
  };

  const isPhoneNumberValid = (phone: string) =>
    typeof phone === "string" &&
    phone.trim() !== "" &&
    /^\d+$/.test(phone.trim());

  const isEmailValid = (email: string) =>
    typeof email === "string" && email.trim().length > 3;

  // ---

  if (!sessionInfo) return "network";
  if (!isNameValid) return "invalidName";
  if (!productCategory) return "invalidCategory";
  if (!isFilteredImgsValid) return "invalidImages";
  if (!isDescriptionValid) return "invalidDescription";
  if (!condition) return "invalidStatus";
  if (!price || !validatePrice(price)) return "invalidPrice";
  if (!isLocationValid) return "invalidLocation";

  // --- контактные данные по отдельности ---
  if (!contactDetails.email || !isEmailValid(contactDetails.email))
    return "invalidEmail";
  if (
    !contactDetails.phoneNumber ||
    !isPhoneNumberValid(contactDetails.phoneNumber)
  )
    return "invalidPhoneNumber";

  return true;
};

export const setErrorAlertText = (errorType: string) => {
  let errorMessage = "";

  switch (errorType) {
    case "network":
      errorMessage = "Network error. Please check your connection.";
      break;
    case "server":
      errorMessage = "Server error. Try again later.";
      break;
    case "invalidName":
      errorMessage = "Invalid product name. Please check the form.";
      break;
    case "invalidCategory":
      errorMessage = "You haven't specified the product category.";
      break;
    case "invalidDescription":
      errorMessage = "The description is too short or empty.";
      break;
    case "invalidLocation":
      errorMessage = "The city you specified does not exist or has a typo";
      break;
    case "invalidPrice":
      errorMessage = "You haven't specified price or it has a typo";
      break;
    case "invalidStatus":
      errorMessage = `Product condition (new/used) is not specified.`;
      break;
    case "invalidContactDetails":
      errorMessage = `The contact details have to be specified.`;
      break;
    case "invalidEmail":
      errorMessage = `Email is empty or consists of a typo.`;
      break;
    case "invalidPhoneNumber":
      errorMessage = `Phone number is empty or consists of a typo.`;
      break;
    case "invalidImages":
      errorMessage = `Product should have an image. Add at least one.`;
      break;
    case "Unexpected":
      errorMessage = `An unexpected error occurred.`;
      break;
    default:
      errorMessage = "An unexpected error occurred.";
  }

  return errorMessage;
};
