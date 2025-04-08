import { client } from "./client.js";
import { setupEvents } from "./events.js";
import { config } from "./config.js";
import { registerSlashCommands } from "./registerCommands.js";

client.once("ready", () => {
  console.log(`Logged in as ${client.user?.tag}`);
});

await registerSlashCommands();
setupEvents(client);
client.login(config.discordToken);
