import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import "./styles.css";
import "./editorial.css";
import "./admin.css";

if ("IntersectionObserver" in window) document.documentElement.classList.add("js");
createRoot(document.getElementById("root")).render(<StrictMode><App /></StrictMode>);
