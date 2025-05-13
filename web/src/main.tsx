import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { createServices } from "./services/index.ts";
import { ServiceContext } from "./contexts/ServiceContext.tsx";

const services = createServices();

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ServiceContext.Provider value={services}>
      <App />
    </ServiceContext.Provider>
  </StrictMode>
);
