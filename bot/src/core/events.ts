import { Client } from "discord.js";
import { setupAddListeners } from "../listeners/addListeners.js";
import { handleHelpCommand } from "../commands/help.js";
import { ServiceContainer } from "../services/index.js";

export function setupEvents(
  discordClient: Client,
  services: ServiceContainer,
  channel: string,
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
