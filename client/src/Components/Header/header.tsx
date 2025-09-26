import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./header.css";
import logo from "./logo_alt.png";
import { useFetchUserQuery } from "services/userService";

const Header = () => {
  const navigate = useNavigate();
  const { data } = useFetchUserQuery();

  const [isBurgerToggled, setBurgerToggled] = useState<Boolean>(false);
  const [isAuth, setIsAuth] = useState<boolean>(false);

  useEffect(() => {
    if (data) {
      setIsAuth(true);
    }
  }, [data]);

  const toggleBurger = () => {
    if (isBurgerToggled) {
      setBurgerToggled(false);
      return;
    }
    setBurgerToggled(true);
  };
  const handleLogout = async () => {
    try {
      const res = await fetch("/api/logout", {
        method: "POST",
        credentials: "same-origin",
      });

      if (res.ok) {
        console.log("sessionInfo:");
      } else {
        console.error("Logout failed");
      }
    } catch (error) {
      console.error("Error during logout:", error);
    }
  };

  return (
    <header className=" w-100">
      <div
        className=" mx-auto row row-cols-3 p-2 desktop-content"
        style={{ maxWidth: "1200px" }}
      >
        <div className="col d-flex justify-content-center">
          <a onClick={() => navigate("/")} className="logo mx-auto">
            <img src={logo} alt="logo image" />
            <p className="m-0">MARKET</p>
          </a>
        </div>
        <div className="col d-flex justify-content-center">
          <div className="mx-3 nav-container d-flex align-items-center gap-3 ">
            <a
              onClick={() => navigate("/messages")}
              className="m-0 text-decoration-none"
            >
              Messages
            </a>
            <a
              onClick={() => navigate("/selected-products")}
              className="m-0 text-decoration-none"
            >
              Favorites
            </a>
            <a
              onClick={() => navigate("/profile-options")}
              className="m-0 text-decoration-none"
            >
              Profile
            </a>
            <a
              onClick={() => navigate("/posted-products")}
              className="m-0 text-decoration-none"
            >
              Posted
            </a>
            {isAuth ? (
              <a
                onClick={() => handleLogout()}
                className="m-0 text-decoration-none d-flex flex-column align-items-center text-nowrap"
              >
                Log out
              </a>
            ) : (
              <a
                onClick={() => navigate("/login")}
                className="m-0 text-decoration-none d-flex flex-column align-items-center text-nowrap"
              >
                Log in
              </a>
            )}
          </div>
        </div>
        <div className="col d-flex justify-content-center">
          <a
            onClick={() => navigate("/add-product")}
            className="btn btn-white my-auto"
          >
            Publish
          </a>
        </div>
      </div>
      <div className="mobile-content  justify-content-around p-2">
        <a
          onClick={() => toggleBurger()}
          className="m-0 text-decoration-none d-flex flex-column align-items-center"
        >
          <svg
            viewBox="3 5 18 14"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M4 18L20 18"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
            />
            <path
              d="M4 12L20 12"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
            />
            <path
              d="M4 6L20 6"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
            />
          </svg>
          Menu
        </a>

        <div
          className={
            isBurgerToggled ? "burger-menu show p-2" : "burger-menu  p-2"
          }
        >
          <a
            onClick={() => navigate("/posted-products")}
            className="m-0 text-decoration-none d-flex flex-column align-items-center"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="currentColor"
              className="bi bi-collection-fill"
              viewBox="0 0 16 16"
            >
              <path d="M0 13a1.5 1.5 0 0 0 1.5 1.5h13A1.5 1.5 0 0 0 16 13V6a1.5 1.5 0 0 0-1.5-1.5h-13A1.5 1.5 0 0 0 0 6zM2 3a.5.5 0 0 0 .5.5h11a.5.5 0 0 0 0-1h-11A.5.5 0 0 0 2 3m2-2a.5.5 0 0 0 .5.5h7a.5.5 0 0 0 0-1h-7A.5.5 0 0 0 4 1" />
            </svg>
            Posted
          </a>
          <a
            onClick={() => navigate("/selected-products")}
            className="m-0 text-decoration-none d-flex flex-column align-items-center"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="currentColor"
              className="bi bi-heart-fill"
              viewBox="0 0 16 16"
            >
              <path
                fillRule="evenodd"
                d="M8 1.314C12.438-3.248 23.534 4.735 8 15-7.534 4.736 3.562-3.248 8 1.314"
              />
            </svg>
            Favorites
          </a>

          <a
            onClick={() => navigate("/messages")}
            className="m-0 text-decoration-none d-flex flex-column align-items-center"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="currentColor"
              className="bi bi-chat-left-text-fill"
              viewBox="0 0 16 16"
            >
              <path d="M0 2a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H4.414a1 1 0 0 0-.707.293L.854 15.146A.5.5 0 0 1 0 14.793zm3.5 1a.5.5 0 0 0 0 1h9a.5.5 0 0 0 0-1zm0 2.5a.5.5 0 0 0 0 1h9a.5.5 0 0 0 0-1zm0 2.5a.5.5 0 0 0 0 1h5a.5.5 0 0 0 0-1z" />
            </svg>
            Messages
          </a>
          {isAuth ? (
            <a
              onClick={() => handleLogout()}
              className="m-0 text-decoration-none d-flex flex-column align-items-center"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                fill="currentColor"
                className="bi bi-box-arrow-in-right"
                viewBox="4 2 12 12"
              >
                <path
                  fill-rule="evenodd"
                  d="M6 3.5a.5.5 0 0 1 .5-.5h8a.5.5 0 0 1 .5.5v9a.5.5 0 0 1-.5.5h-8a.5.5 0 0 1-.5-.5v-2a.5.5 0 0 0-1 0v2A1.5 1.5 0 0 0 6.5 14h8a1.5 1.5 0 0 0 1.5-1.5v-9A1.5 1.5 0 0 0 14.5 2h-8A1.5 1.5 0 0 0 5 3.5v2a.5.5 0 0 0 1 0z"
                />
                <path
                  fill-rule="evenodd"
                  d="M11.854 8.354a.5.5 0 0 0 0-.708l-3-3a.5.5 0 1 0-.708.708L10.293 7.5H1.5a.5.5 0 0 0 0 1h8.793l-2.147 2.146a.5.5 0 0 0 .708.708z"
                />
              </svg>
              Log out
            </a>
          ) : (
            <a
              onClick={() => navigate("/login")}
              className="m-0 text-decoration-none d-flex flex-column align-items-center"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                fill="currentColor"
                className="bi bi-box-arrow-in-right"
                viewBox="4 2 12 12"
                style={{ transform: "rotate(-180deg)" }}
              >
                <path
                  fill-rule="evenodd"
                  d="M6 3.5a.5.5 0 0 1 .5-.5h8a.5.5 0 0 1 .5.5v9a.5.5 0 0 1-.5.5h-8a.5.5 0 0 1-.5-.5v-2a.5.5 0 0 0-1 0v2A1.5 1.5 0 0 0 6.5 14h8a1.5 1.5 0 0 0 1.5-1.5v-9A1.5 1.5 0 0 0 14.5 2h-8A1.5 1.5 0 0 0 5 3.5v2a.5.5 0 0 0 1 0z"
                />
                <path
                  fill-rule="evenodd"
                  d="M11.854 8.354a.5.5 0 0 0 0-.708l-3-3a.5.5 0 1 0-.708.708L10.293 7.5H1.5a.5.5 0 0 0 0 1h8.793l-2.147 2.146a.5.5 0 0 0 .708.708z"
                />
              </svg>
              Log in
            </a>
          )}
        </div>
        <a
          onClick={() => navigate("/")}
          className="m-0 text-decoration-none d-flex flex-column align-items-center"
        >
          <svg
            fill="currentColor"
            version="1.1"
            id="Capa_1"
            xmlns="http://www.w3.org/2000/svg"
            xmlnsXlink="http://www.w3.org/1999/xlink"
            viewBox="0 18 495 460"
            xmlSpace="preserve"
          >
            <g>
              <g>
                <g>
                  <path
                    d="M487.083,225.514l-75.08-75.08V63.704c0-15.682-12.708-28.391-28.413-28.391c-15.669,0-28.377,12.709-28.377,28.391
            v29.941L299.31,37.74c-27.639-27.624-75.694-27.575-103.27,0.05L8.312,225.514c-11.082,11.104-11.082,29.071,0,40.158
            c11.087,11.101,29.089,11.101,40.172,0l187.71-187.729c6.115-6.083,16.893-6.083,22.976-0.018l187.742,187.747
            c5.567,5.551,12.825,8.312,20.081,8.312c7.271,0,14.541-2.764,20.091-8.312C498.17,254.586,498.17,236.619,487.083,225.514z"
                  />
                  <path
                    d="M257.561,131.836c-5.454-5.451-14.285-5.451-19.723,0L72.712,296.913c-2.607,2.606-4.085,6.164-4.085,9.877v120.401
            c0,28.253,22.908,51.16,51.16,51.16h81.754v-126.61h92.299v126.61h81.755c28.251,0,51.159-22.907,51.159-51.159V306.79
            c0-3.713-1.465-7.271-4.085-9.877L257.561,131.836z"
                  />
                </g>
              </g>
            </g>
          </svg>
          Home
        </a>

        <a
          onClick={() => navigate("/profile-options")}
          className="m-0 text-decoration-none d-flex flex-column align-items-center"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="currentColor"
            className="bi bi-person-fill"
            viewBox="0 0 16 16"
          >
            <path d="M3 14s-1 0-1-1 1-4 6-4 6 3 6 4-1 1-1 1zm5-6a3 3 0 1 0 0-6 3 3 0 0 0 0 6" />
          </svg>
          Profile
        </a>

        <a
          onClick={() => navigate("/add-product")}
          className="m-0 text-decoration-none d-flex flex-column align-items-center"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            fill="currentColor"
            className="bi bi-plus-square-fill"
            viewBox="0 0 16 16"
          >
            <path d="M2 0a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2zm6.5 4.5v3h3a.5.5 0 0 1 0 1h-3v3a.5.5 0 0 1-1 0v-3h-3a.5.5 0 0 1 0-1h3v-3a.5.5 0 0 1 1 0" />
          </svg>
          Post
        </a>
      </div>
    </header>
  );
};

export default Header;
