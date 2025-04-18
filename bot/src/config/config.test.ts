import { describe, expect, test, vi, beforeEach, afterEach } from "vitest";
import { getConfig } from "./config.js";

describe("config", () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  test("Should import environment variables without errors", async () => {
    const env = {
      DISCORD_TOKEN: "mock-token",
      CLIENT_ID: "mock-client-id",
      TARGET_CHANNEL: "mock-target-channel",
    };

    const config = getConfig(env);

    expect(config.discordToken).toBe("mock-token");
    expect(config.clientId).toBe("mock-client-id");
    expect(config.targetChannel).toBe("mock-target-channel");
  });

  test("Should throw error when .env secrets are missing", async () => {
    const env = {};

    expect(() => getConfig(env)).toThrowError(
      "Missing required environment variable: DISCORD_TOKEN"
    );
  });
});
