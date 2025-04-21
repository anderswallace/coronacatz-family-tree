import { createClient } from "./core/client.js";
import { setupEvents } from "./core/events.js";
import { getConfig } from "./config/config.js";
import { registerSlashCommands } from "./core/registerCommands.js";
import { initFirebase } from "./services/firebase.js";

export async function main() {
  const config = getConfig(process.env);
  const client = createClient();
  const database = initFirebase(config.firebaseDbUrl);

  client.once("ready", () => {
    console.log(`Logged in as ${client.user?.tag}`);
  });

  await registerSlashCommands(config.discordToken, config.clientId);
  setupEvents(client, database, config.targetChannel);
  client.login(config.discordToken);
}
