import { createClient } from "./core/client.js";
import { setupEvents } from "./core/events.js";
import { getConfig } from "./config/config.js";
import { registerSlashCommands } from "./core/registerCommands.js";
import { buildServices } from "./services/index.js";
import { initPrismaClient } from "./core/prismaClient.js";

export async function main() {
  const config = getConfig(process.env);
  const discordClient = createClient();
  const prismaClient = initPrismaClient();
  const services = buildServices(prismaClient);

  discordClient.once("ready", () => {
    console.log(`Logged in as ${discordClient.user?.tag}`);
  });

  await registerSlashCommands(config.discordToken, config.clientId);
  setupEvents(discordClient, services, config.targetChannel);
  discordClient.login(config.discordToken);
}
