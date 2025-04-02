import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import Footer from "./mainPage/Footer/footer.js";
import {Routing} from "./routing/Routing.tsx";

const root = ReactDOM.createRoot(document.getElementById("root")!);
root.render(
    <React.StrictMode>
        <Routing/>
    </React.StrictMode>
);
