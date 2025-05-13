import { createContext, useContext } from "react";
import type { AppServices } from "../services";

export const ServiceContext = createContext<AppServices | null>(null);

export function useServices(): AppServices {
  const context = useContext(ServiceContext);

  if (!context) {
    throw new Error("Service Context not initialized");
  }

  return context;
}
