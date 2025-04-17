import { Client } from "discord.js";
import { setupAddListeners } from "../listeners/addListeners.js";
import { handleHelpCommand } from "../commands/help.js";

export function setupEvents(client: Client) {
  setupAddListeners(client);

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
