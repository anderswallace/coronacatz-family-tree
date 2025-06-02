import dotenv from "dotenv";
import { ConfigError } from "../errors/customErrors.js";
import { createDiscordChannel } from "../types/discord.js";

dotenv.config();

export type Env = Record<string, string | undefined>;

function getEnv(env: Env, key: string): string {
  const value = env[key];
  if (!value) {
    throw new ConfigError(key);
  }
  return value;
}

export function getConfig(env: Env) {
  return {
    discordToken: getEnv(env, "DISCORD_TOKEN"),
    clientId: getEnv(env, "CLIENT_ID"),
    targetChannel: createDiscordChannel(getEnv(env, "TARGET_CHANNEL")),
    guildId: getEnv(env, "GUILD_ID"),
  };
}
