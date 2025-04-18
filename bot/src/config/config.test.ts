import { describe, expect, test, vi, beforeEach, afterEach } from "vitest";
import { getConfig } from "./config.js";

describe("config", () => {
  beforeEach(() => {
    process.env.DISCORD_TOKEN = "mock-token";
    process.env.CLIENT_ID = "mock-client-id";
  });

  afterEach(() => {
    vi.clearAllMocks();
    delete process.env.DISCORD_TOKEN;
    delete process.env.CLIENT_ID;
  });

  test("Should import environment variables without errors", async () => {
    const config = getConfig();

    expect(config.discordToken).toBe("mock-token");
    expect(config.clientId).toBe("mock-client-id");
  });

  test("Should throw error when .env secret is missing", async () => {
    delete process.env.DISCORD_TOKEN;

    expect(() => getConfig()).toThrowError(
      "Missing required environment variable: DISCORD_TOKEN"
    );
  });
});
