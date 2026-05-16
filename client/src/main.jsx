import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { Toaster } from "react-hot-toast";

import App from "./App.jsx";
import "./styles.css";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <App />
    <Toaster
      position="top-right"
      toastOptions={{
        duration: 4000,
        style: {
          background: "#1e1e3a",
          color: "#f1f5f9",
          border: "1px solid rgba(255, 255, 255, 0.08)",
          borderRadius: "0.75rem",
          fontSize: "0.875rem"
        },
        success: {
          iconTheme: {
            primary: "#06b6d4",
            secondary: "#0a0a1a"
          }
        },
        error: {
          iconTheme: {
            primary: "#ef4444",
            secondary: "#0a0a1a"
          }
        }
      }}
    />
  </StrictMode>
);
