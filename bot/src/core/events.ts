import { Client } from "discord.js";
import { setupAddListeners } from "../listeners/addListeners.js";
import { handleHelpCommand } from "../commands/help.js";
import { Database } from "firebase/database";

export function setupEvents(
  client: Client,
  database: Database,
  channel: string
) {
  setupAddListeners(client, database, channel);

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
