import { describe, expect, test, vi, beforeEach, afterEach } from "vitest";

describe("config", () => {
  beforeEach(() => {
    process.env.DISCORD_TOKEN = "mock-token";
    process.env.CLIENT_ID = "mock-client-id";
  });

  afterEach(() => {
    vi.clearAllMocks();
    vi.resetModules();
  });

  test("Environment variables should be imported without errors", async () => {
    const { config } = await import("./config.js");

    expect(config.discordToken).toBe("mock-token");
    expect(config.clientId).toBe("mock-client-id");
  });

  test("Should throw error when .env secret is missing", async () => {
    process.env.DISCORD_TOKEN = "";
    vi.resetModules();

    await expect(import("./config.js")).rejects.toThrowError(
      "Missing required environment variable: DISCORD_TOKEN"
    );
  });
});
