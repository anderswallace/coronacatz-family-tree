import { createContext, useContext } from "react";
import type { AppServices } from "../services";
import { ContextError } from "../errors/customErrors";

export const ServiceContext = createContext<AppServices | null>(null);

export function useServices(): AppServices {
  const context = useContext(ServiceContext);

  if (!context) {
    throw new ContextError();
  }

  return context;
}
