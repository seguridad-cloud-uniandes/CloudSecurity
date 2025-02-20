import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter as Router } from "react-router-dom";
import AppRouter from "./router/index";
import { AuthProvider } from "./context/AuthContext"; // ✅ Import AuthProvider
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
    <AuthProvider>
      <Router>
        <AppRouter />
      </Router>
    </AuthProvider>
);
