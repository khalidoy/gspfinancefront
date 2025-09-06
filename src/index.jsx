import React from "react";
import ReactDOM from "react-dom/client";
import { Provider } from "./components/ui/provider";
import "./index.css";
import App from "./App";
import "./i18n";

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <Provider>
      <App />
    </Provider>
  </React.StrictMode>
);

