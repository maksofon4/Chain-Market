import ReactDOM from "react-dom/client";
import "./index.css";
import Header from "Components/Header/header";
import Footer from "./Components/Footer/footer";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import MainPage from "mainPage/mainpage";
import { Navigate } from "react-router-dom";
import PageTab from "TabPages/pageTab/pageTab";
import Messages from "TabPages/Messages/messages";
import ProtectedRoute from "Components/ProtectedRoute/protectedRoute";
import AuthForm from "Login/logReg";
import SelectedList from "TabPages/selectedProducts/selected";
import PostedList from "TabPages/PostedAds/posted";
import ProfileSettings from "TabPages/Profile/profile";
import AddProduct from "AddProduct/addProduct";
import BackgroundWrapper from "Components/BackgroundWrapper/BackgroundWrapper";
import GlobalData from "Components/GlobalData/GlobalData";
import SearchAds from "SearchAds/searchAds";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";

const root = ReactDOM.createRoot(document.getElementById("root")!);
root.render(
  // <React.StrictMode>
  <BrowserRouter>
    <GlobalData>
      <BackgroundWrapper>
        <Routes>
          <Route path="/login" element={<AuthForm mode="login" />} />
          <Route path="/register" element={<AuthForm mode="register" />} />

          <Route
            path="/"
            element={
              <>
                <Header />
                <MainPage />
              </>
            }
          />
          <Route
            path="/messages/chat/:chatId"
            element={
              <ProtectedRoute>
                <PageTab content={<Messages />} />
              </ProtectedRoute>
            }
          />
          <Route
            path="/messages"
            element={
              <ProtectedRoute>
                <PageTab content={<Messages />} />
              </ProtectedRoute>
            }
          />

          <Route
            path="/selected-products"
            element={
              <ProtectedRoute>
                <PageTab content={<SelectedList />} />
              </ProtectedRoute>
            }
          />
          <Route
            path="/posted-products"
            element={
              <ProtectedRoute>
                <PageTab content={<PostedList />} />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile-options"
            element={
              <ProtectedRoute>
                <PageTab content={<ProfileSettings />} />
              </ProtectedRoute>
            }
          />

          <Route
            path="/add-product"
            element={
              <ProtectedRoute>
                <AddProduct />
              </ProtectedRoute>
            }
          />
          <Route
            path="/search-Ads"
            element={
              <>
                <Header />
                <SearchAds />
              </>
            }
          />

          <Route path="*" element={<Navigate to="/" replace={true} />} />
        </Routes>
      </BackgroundWrapper>
      <Footer />
    </GlobalData>
  </BrowserRouter>
  // </React.StrictMode>
);
