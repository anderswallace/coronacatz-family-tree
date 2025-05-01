import { describe, test, expect } from "vitest";
import { ConfigError, NodeError, UserNotFoundError } from "./customErrors.js";

describe("customError", () => {
  test("UserNotFoundError error should throw properly formatted message", () => {
    const mockId = "mock-id";
    try {
      throw new UserNotFoundError(mockId);
    } catch (error) {
      if (error instanceof UserNotFoundError) {
        expect(error.name).toBe("UserNotFoundError");
        expect(error.message.includes(mockId)).toBe(true);
      } else {
        throw error;
      }
    }
  });

  test("NodeError error should throw properly formatted message", () => {
    const mockId = "mock-id";
    const mockMessage = "mock-message";
    try {
      throw new NodeError(mockId, mockMessage);
    } catch (error) {
      if (error instanceof NodeError) {
        expect(error.name).toBe("NodeError");
        expect(error.message.includes(mockId)).toBe(true);
        expect(error.message.includes(mockMessage)).toBe(true);
      } else {
        throw error;
      }
    }
  });

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
