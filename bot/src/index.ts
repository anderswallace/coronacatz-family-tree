import { client } from "./core/client.js";
import { setupEvents } from "./core/events.js";
import { getConfig } from "./config/config.js";
import { registerSlashCommands } from "./core/registerCommands.js";

async function init() {
  const config = getConfig();

  client.once("ready", () => {
    console.log(`Logged in as ${client.user?.tag}`);
  });

  await registerSlashCommands(config.discordToken, config.clientId);
  setupEvents(client);
  client.login(config.discordToken);
}

if (process.argv[1] === new URL(import.meta.url).pathname) {
  init().catch((error) => {
    console.error("Failed to start bot: ", error);
    process.exit(1);
  });
}

export { init };
