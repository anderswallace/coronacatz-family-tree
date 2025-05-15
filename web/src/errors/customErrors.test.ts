import { describe, test, expect } from "vitest";
import { ConfigError } from "./customErrors.js";

describe("customError", () => {
  test("ConfigError error should throw properly formatted message", () => {
    const mockId = "mock-id";
    try {
      throw new ConfigError(mockId);
    } catch (error) {
      if (error instanceof ConfigError) {
        expect(error.name).toBe("ConfigError");
        expect(error.message.includes(mockId)).toBe(true);
      } else {
        throw error;
      }
    }
  });
});
