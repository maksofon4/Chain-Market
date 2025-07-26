import React, { useEffect, useState } from "react";

type Props = {
  status: string | null;
  onClose: () => void;
};

const Alert: React.FC<Props> = ({ status, onClose }) => {
  const [customActiveAlert, setCustomActiveAlert] = useState<
    string | undefined
  >();
  const [alertText, setAlertText] = useState<string | undefined>();

  useEffect(() => {
    if (!status) return;

    if (status === "success") {
      setCustomActiveAlert("success");
      setAlertText(undefined); // на всякий случай очищаем
      return;
    }

    setCustomActiveAlert("error");

    let errorMessage = "";

    switch (status) {
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

    setAlertText(errorMessage);
  }, [status]);

  if (!customActiveAlert) return null;

  return (
    <>
      {customActiveAlert === "error" && alertText && (
        <div className="errorAlert">
          <h1>
            <svg className="icon icon-warning">
              <use xlinkHref="/symbol-defs.svg#icon-warning"></use>
            </svg>
            Error
          </h1>
          <p>{alertText}</p>
          <div className="wrapper">
            <button
              onClick={() => {
                setCustomActiveAlert(undefined);
                onClose();
              }}
            >
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
              onClick={() => {
                setCustomActiveAlert(undefined);
                onClose();
              }}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default Alert;
