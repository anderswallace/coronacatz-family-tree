import { Client } from "discord.js";
import { setupAddListener } from "../listeners/addListener.js";
import { handleHelpCommand } from "../commands/help.js";

export function setupEvents(client: Client) {
  setupAddListener(client);

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
