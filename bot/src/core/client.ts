import { Client, GatewayIntentBits, Partials } from "discord.js";

/**
 * Creates Discord Client for bot to use to interact with Discord API
 *
 * Is instantiated with the necessary intents (permissions) for the bot perform
 * its core functionality
 *
 * @returns DiscordClient for API interaction
 */
export function createClient(): Client {
  return new Client({
    intents: [
      GatewayIntentBits.Guilds,
      GatewayIntentBits.GuildMembers,
      GatewayIntentBits.GuildMessages,
      GatewayIntentBits.MessageContent,
    ],
    partials: [Partials.GuildMember],
  });
}
