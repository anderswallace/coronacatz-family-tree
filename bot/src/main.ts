import { createClient } from "./core/client.js";
import { setupEvents } from "./core/events.js";
import { getConfig } from "./config/config.js";
import { registerSlashCommands } from "./core/registerCommands.js";

export async function main() {
  const config = getConfig(process.env);
  const client = createClient();

  client.once("ready", () => {
    console.log(`Logged in as ${client.user?.tag}`);
  });

  await registerSlashCommands(config.discordToken, config.clientId);
  setupEvents(client, config.targetChannel);
  client.login(config.discordToken);
}
