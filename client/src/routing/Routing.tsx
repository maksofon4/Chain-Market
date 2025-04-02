import {BrowserRouter, Navigate, Route, Routes} from "react-router-dom";
import AuthForm from "../Login/logReg.tsx";
import Header from "../mainPage/NavBar/NavBar.tsx";
import MainPage from "../mainPage/mainpage.tsx";
import ProtectedRoute from "./protectedRoute.tsx";
import PageTab from "../TabPages/pageTab/pageTab.tsx";
import Messages from "../TabPages/Messages/messages.tsx";
import SelectedList from "../TabPages/selectedProducts/selected.tsx";
import PostedList from "../TabPages/PostedAds/posted.tsx";
import ProfileSettings from "../TabPages/Profile/profile.tsx";
import AddProduct from "../AddProduct/addProduct.tsx";
import React from "react";
import Footer from "../mainPage/Footer/footer";

export const Routing = () => {
    return <BrowserRouter> <Routes>
        <Route path="/login" element={<AuthForm mode="login"/>}/>
        <Route path="/register" element={<AuthForm mode="register"/>}/>

        <Route
            path="/"
            element={
                <>
                    <Header/>
                    <MainPage/>
                </>
            }
        />
        <Route
            path="/messages/chat/:chatId"
            element={
                <ProtectedRoute>
                    <PageTab content={<Messages/>}/>
                </ProtectedRoute>
            }
        />
        <Route
            path="/messages"
            element={
                <ProtectedRoute>
                    <PageTab content={<Messages/>}/>
                </ProtectedRoute>
            }
        />

        <Route
            path="/selected-products"
            element={
                <ProtectedRoute>
                    <PageTab content={<SelectedList/>}/>
                </ProtectedRoute>
            }
        />
        <Route
            path="/posted-products"
            element={
                <ProtectedRoute>
                    <PageTab content={<PostedList/>}/>
                </ProtectedRoute>
            }
        />
        <Route
            path="/profile-options"
            element={
                <ProtectedRoute>
                    <PageTab content={<ProfileSettings/>}/>
                </ProtectedRoute>
            }
        />

        <Route
            path="/add-product"
            element={
                <ProtectedRoute>
                    <AddProduct/>
                </ProtectedRoute>
            }
        />

        <Route path="*" element={<Navigate to="/" replace={true}/>}/>
    </Routes>
        <Footer/>
    </BrowserRouter>
}