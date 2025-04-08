import { client } from "./core/client.js";
import { setupEvents } from "./core/events.js";
import { config } from "./config/config.js";
import { registerSlashCommands } from "./core/registerCommands.js";

client.once("ready", () => {
  console.log(`Logged in as ${client.user?.tag}`);
});

await registerSlashCommands();
setupEvents(client);
client.login(config.discordToken);
