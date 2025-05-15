import { describe, test, expect } from "vitest";
import { ConfigError, ContextError } from "./customErrors.js";

describe("customError", () => {
  test("ConfigError error should throw properly formatted message", () => {
    const mockId = "mock-id";
    const error = new ConfigError(mockId);

    expect(error.name).toBe("ConfigError");
    expect(error.message).toContain(mockId);
    expect(error).toBeInstanceOf(Error);
  });

  test("ContextError error should throw properly formatted message", () => {
    const error = new ContextError();

    expect(error.name).toBe("ContextError");
    expect(error.message).toContain("Service Context");
    expect(error).toBeInstanceOf(Error);
  });
});
