import { describe, expect, test, vi, afterEach } from "vitest";
import { getConfig } from "./config.js";
import { ConfigError } from "../errors/customErrors.js";

describe("config", () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  test("Should import environment variables without errors", async () => {
    const env = {
      DISCORD_TOKEN: "mock-token",
      CLIENT_ID: "mock-client-id",
      TARGET_CHANNEL: "mock-target-channel",
      GUILD_ID: "mock-guild-id",
    };

    const config = getConfig(env);

    expect(config.discordToken).toBe(env.DISCORD_TOKEN);
    expect(config.clientId).toBe(env.CLIENT_ID);
    expect(config.targetChannel).toBe(env.TARGET_CHANNEL);
    expect(config.guildId).toBe(env.GUILD_ID);
  });

  test("Should throw error when .env secrets are missing", async () => {
    const env = {};

    expect(() => getConfig(env)).toThrowError(ConfigError);
  });
});
