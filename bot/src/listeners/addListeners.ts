import { Client } from "discord.js";
import { createOnMessageCreate } from "../events/onMessageCreate.js";
import { ServiceContainer } from "../services/index.js";

export function setupAddListeners(
  client: Client,
  services: ServiceContainer,
  channelName: string,
) {
  const onMessageCreate = createOnMessageCreate(services, channelName);
  client.on("messageCreate", onMessageCreate);
}
