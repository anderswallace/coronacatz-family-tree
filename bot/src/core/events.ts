import { Client } from "discord.js";
import { setupAddListeners } from "../listeners/addListeners.js";
import { handleHelpCommand } from "../commands/help.js";
import { ServiceContainer } from "../services/index.js";
import { DiscordChannel } from "../types/discord.js";

/**
 * Sets up event listeners and slash command handlers for bot functionality
 *
 * @param discordClient - Client for interacting with Discord API
 * @param services - Container for services utilized by the bot
 * @param channel - The target channel for event listeners
 */
export function setupEvents(
  discordClient: Client,
  services: ServiceContainer,
  channel: DiscordChannel,
) {
  setupAddListeners(discordClient, services, channel);

  discordClient.on("interactionCreate", async (interaction) => {
    // slash command handling
    if (!interaction.isChatInputCommand()) {
      return;
    }

    switch (interaction.commandName) {
      case "help":
        await handleHelpCommand(interaction);
        break;
    }
  });
}
