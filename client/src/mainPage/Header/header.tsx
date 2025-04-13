import { useContext, useEffect, useState } from "react";
import { SessionContext } from "GlobalData";
import "./header.css"; // Make sure to add your CSS file for styling
import logo from "./logo_alt.png";

interface SessionInfo {
  userId: string;
  username: string;
  email: string;
  password: string;
  profilePhoto: string;
  pinnedChats: string[];
  selectedProducts: string[];
}

const Header = () => {
  const sessionInfo = useContext(SessionContext);
  const [user, setUser] = useState<SessionInfo | null>(null);
  const [isAuth, setAuth] = useState<boolean | null>(null);

  useEffect(() => {
    setUser(sessionInfo);
    setAuth(sessionInfo.userId !== null);
  }, [sessionInfo]);

  const handleLogout = async () => {
    try {
      const res = await fetch("/api/logout", {
        method: "GET", // 'GET' is typically fine for logout
        credentials: "same-origin", // Send the session cookie
      });

      if (res.ok) {
      } else {
        console.error("Logout failed");
      }
    } catch (error) {
      console.error("Error during logout:", error);
    }
  };

  return (
    <header className="dynamic-links">
      <a href="/" className="logo">
        <img src={logo} alt="logo image" />
        <p id="logo-text">MARKET</p>
      </a>
      <ul className="nav-links">
        <li>
          <a id="navMessages" href="/messages">
            <p className="globalCounterElement" style={{ display: "none" }}></p>
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24">
              <use xlinkHref="symbol-defs.svg#icon-envelop"></use>
            </svg>
            Messages
          </a>
        </li>
        <li>
          <a href="">EN/UA</a>
        </li>
        <li>
          <a href="#about">About</a>
        </li>
        <li className="profile-container">
          <a id="myprofile" href="/profile-options">
            <svg width="24" height="24">
              <use xlinkHref="symbol-defs.svg#icon-user"></use>
            </svg>
            <p id="profile-container-text">My profile</p>

            {isAuth && (
              <svg id="icon-arrowdown" width="24" height="24">
                <use xlinkHref="symbol-defs.svg#icon-arrowdown"></use>
              </svg>
            )}
          </a>

          {isAuth && user && (
            <ul className="profile-dropdown">
              <li id="profile-options-container">
                <a id="profile-options" href="/profile-options">
                  <img
                    className="profile-image"
                    src={user.profilePhoto}
                    alt="profile"
                  />
                  <p id="profile-name">{user.username}</p>
                  <p id="profileTextBottom">Your profile</p>
                </a>
              </li>
              <li>
                <a href="/posted-products">My ads</a>
              </li>
              <li>
                <a href="/selected-products">Selected</a>
              </li>
              <li id="profileMessages">
                <a href="/messages">Messages</a>
              </li>
              <li className="exit-btn" onClick={handleLogout}>
                <a href="/logout">Exit</a>
              </li>
            </ul>
          )}
        </li>
      </ul>

      <a id="add-product" href="/add-product">
        <p className="text">Add product...</p>
        <svg width="24" height="24">
          <use xlinkHref="symbol-defs.svg#icon-plus"></use>
        </svg>
      </a>
    </header>
  );
};

export default Header;
