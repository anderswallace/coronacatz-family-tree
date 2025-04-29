import { Client } from "discord.js";
import { createOnMessageCreate } from "../events/onMessageCreate.js";
import { createOnGuildMemberRemove } from "../events/onGuildMemberRemove.js";
import { ServiceContainer } from "../services/index.js";

export function setupAddListeners(
  client: Client,
  services: ServiceContainer,
  channelName: string,
) {
  const onMessageCreate = createOnMessageCreate(services, channelName);
  const onGuildMemberRemove = createOnGuildMemberRemove(services);

  client.on("messageCreate", onMessageCreate);
  client.on("guildMemberRemove", onGuildMemberRemove);
}
