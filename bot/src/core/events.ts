import { Client } from "discord.js";
import { setupAddListeners } from "../listeners/addListeners.js";
import { handleHelpCommand } from "../commands/help.js";
import { ServiceContainer } from "../services/index.js";

export function setupEvents(
  client: Client,
  services: ServiceContainer,
  channel: string,
) {
  setupAddListeners(client, services, channel);

  client.on("interactionCreate", async (interaction) => {
    // slash command handling
    if (!interaction.isChatInputCommand()) {
      return;
    }

    if (interaction.commandName === "help") {
      await handleHelpCommand(interaction);
    }
  });
}
