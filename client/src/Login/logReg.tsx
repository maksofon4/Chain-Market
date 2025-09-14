import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

import "./logReg.css";

const AuthForm: React.FC<{ mode: "login" | "register" }> = ({ mode }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [isChecked, setIsChecked] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault(); // Prevent default form submission behavior

    const requestData = {
      email,
      password,
      username: mode === "register" ? username : undefined,
    };

    try {
      const response = await fetch(`/api/${mode}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestData),
      });

      if (response.ok) {
        if (mode === "register") navigate("/login");
        if (mode === "login") {
          navigate("/");
          navigate(0);
        }
      } else {
        // Handle error response here
        console.error("Error: ", response.statusText);
      }
    } catch (error) {
      console.error("Network error: ", error);
    }
  };

  return (
    <div className="authentication-container">
      <div className="divider1">
        <div className="mode-name">
          <a
            onClick={() => navigate("/register")}
            className={mode === "register" ? "active" : ""}
          >
            Register
          </a>
          <a
            onClick={() => navigate("/login")}
            className={mode === "login" ? "active" : ""}
          >
            Log in
          </a>
        </div>
        <form onSubmit={handleSubmit}>
          {mode === "register" && (
            <div className="form-group">
              <p className="inputName">Username:</p>
              <label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                />
              </label>
            </div>
          )}

          <div className="form-group">
            <p className="inputName">Email:</p>
            <label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </label>
          </div>

          <div className="form-group">
            <p className="inputName">Password:</p>
            <label>
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button
                className="showPasswordButton"
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                }}
              >
                {showPassword ? (
                  <svg className="icon icon-eye">
                    <use xlinkHref="symbol-defs.svg#icon-eye"></use>
                  </svg>
                ) : (
                  <svg className="icon icon-eye-blocked">
                    <use xlinkHref="symbol-defs.svg#icon-eye-blocked"></use>
                  </svg>
                )}
              </button>
            </label>
          </div>
          {mode === "register" && (
            <div className="checkbox">
              <label>
                <p>
                  <span id="checkboxContainer">
                    <input
                      id="newCheckbox"
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => setIsChecked(!isChecked)}
                      required
                    />
                    <span id="checkboxSpan"></span>
                  </span>
                  By creating a profile on Chain Market, you agree to the{" "}
                  <a>Terms of Use</a>
                </p>
              </label>
            </div>
          )}
          <button
            type="submit"
            className="submitBtn"
            disabled={mode === "register" && !isChecked}
          >
            {mode === "register" ? "Register" : "Log in"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AuthForm;
