import { describe, test, expect } from "vitest";
import {
  ConfigError,
  PrismaOperationError,
  UserAlreadyExistsError,
  UserNotFoundError,
} from "./customErrors.js";

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

  test("UserAlreadyExistsError error should throw properly formatted message", () => {
    const mockId = "mock-id";
    try {
      throw new UserAlreadyExistsError(mockId);
    } catch (error) {
      if (error instanceof UserAlreadyExistsError) {
        expect(error.name).toBe("UserAlreadyExistsError");
        expect(error.message.includes(mockId)).toBe(true);
      } else {
        throw error;
      }
    }
  });

  test("NodeError error should throw properly formatted message", () => {
    const mockMessage = "mock-message";
    try {
      throw new PrismaOperationError(mockMessage);
    } catch (error) {
      if (error instanceof PrismaOperationError) {
        expect(error.name).toBe("PrismaOperationError");
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
