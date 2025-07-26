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
