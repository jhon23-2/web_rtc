import React from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./src/App.jsx";
import { PeerContextProvider } from "./src/context/PeerContext.jsx";
import "./styles.css";

const root = createRoot(document.getElementById("root"));
root.render(
<BrowserRouter>
  <PeerContextProvider>
    <App />
  </PeerContextProvider>
</BrowserRouter>
);
