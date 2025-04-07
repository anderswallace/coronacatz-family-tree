import { Client } from "discord.js";
import { setupAddListener } from "./listeners/addListener.js";

export function setupEvents(client: Client) {
  setupAddListener(client);

  client.on("interactionCreate", async (interaction) => {
    // slash command handling
  });
}
