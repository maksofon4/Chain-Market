import { useState } from "react";
import { useNavigate } from "react-router-dom";
import GoogleIcon from "./googleicon.svg";
import AppStoreIcon from "./appstore-icon.svg";
import "./footer.css";
import logo from "./logo_alt.png";

function Footer() {
  const [text, setText] = useState("Get the app for free on your phone");
  const navigate = useNavigate();

  return (
    <footer className="py-4">
      <div className="footer-content">
        <div className="links-logo">
          <a className="logo-container">
            <div className="logo-img-container">
              <img src={logo} />
              <p>MARKET</p>
            </div>
            <p className="text-under-logo">MAKING CRYPTOCURRENCY WORLDWIDE</p>
          </a>
          <ul className="footer-links">
            <li>
              <a onClick={() => navigate("/help")}>Help/feedback</a>
            </li>
            <li>
              <a>Paid services</a>
            </li>
            <li>
              <a>Terms of use</a>
            </li>
            <li>
              <a>Privacy Policy</a>
            </li>
            <li>
              <a>Advertising on the site</a>
            </li>
            <li>
              <a>Safe delivery</a>
            </li>
          </ul>
        </div>

        <div className="app-container">
          <div className="app-links">
            <a
              className="googleapp"
              onMouseEnter={() => setText("Get it on Google Play")}
              onMouseLeave={() => setText("Get the app for free on your phone")}
            >
              <img src={GoogleIcon} alt="Google Play" />
            </a>
            <a
              className="appstore"
              onMouseEnter={() => setText("Get it on the Apple Store")}
              onMouseLeave={() => setText("Get the app for free on your phone")}
            >
              <img src={AppStoreIcon} alt="App Store" />
            </a>
          </div>
          <div className="notes">
            <p>{text}</p>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
