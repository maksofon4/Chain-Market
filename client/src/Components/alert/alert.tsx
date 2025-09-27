import React, { useEffect, useState } from "react";

type Props = {
  status: string | null;
  text: string;
  onClose: () => void;
};

const Alert: React.FC<Props> = ({ status, text, onClose }) => {
  const [customActiveAlert, setCustomActiveAlert] = useState<
    string | undefined
  >();

  useEffect(() => {
    if (!status) return;

    if (status === "success") {
      setCustomActiveAlert("success");
      return;
    }

    setCustomActiveAlert("error");
  }, [status]);

  if (!customActiveAlert) return null;

  return (
    <>
      {customActiveAlert === "error" && text && (
        <div className="errorAlert">
          <h1>
            <svg className="icon icon-warning">
              <use xlinkHref="/symbol-defs.svg#icon-warning"></use>
            </svg>
            Error
          </h1>
          <p>{text}</p>
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
          <p>{text}</p>
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
