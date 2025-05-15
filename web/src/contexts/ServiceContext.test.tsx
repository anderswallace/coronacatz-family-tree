import { describe, test, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { useServices, ServiceContext } from "./ServiceContext";
import { AppServices } from "../services";
import React from "react";
import { ContextError } from "../errors/customErrors";

function Consumer() {
  const services = useServices();
  return <div>{services.nodeService ? "Loaded" : "Missing"}</div>;
}

const mockServices = {
  nodeService: { fetchAllNodes: vi.fn() },
} as unknown as AppServices;

describe("ServiceContext", () => {
  test("useServices returns context value when wrapped in provider", () => {
    render(
      <ServiceContext.Provider value={mockServices}>
        <Consumer />
      </ServiceContext.Provider>
    );

    expect(screen.getByText("Loaded")).toBeInTheDocument();
  });

  test("useServices should throw an error when not wrapped in provider", () => {
    const renderWithError = () =>
      render(
        <React.StrictMode>
          <Consumer />
        </React.StrictMode>
      );

    expect(renderWithError).toThrow(ContextError);
  });
});
