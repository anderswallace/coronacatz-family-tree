import { Client } from "discord.js";
import { createOnMessageCreate } from "../events/onMessageCreate.js";
import { createOnGuildMemberRemove } from "../events/onGuildMemberRemove.js";
import { ServiceContainer } from "../services/index.js";
import { createOnGuildMemberUpdate } from "../events/onGuildMemberUpdate.js";

export function setupAddListeners(
  discordClient: Client,
  services: ServiceContainer,
  channelName: string,
) {
  const onMessageCreate = createOnMessageCreate(services, channelName);
  const onGuildMemberRemove = createOnGuildMemberRemove(services);
  const onGuildMemberUpdate = createOnGuildMemberUpdate(services);

  discordClient.on("messageCreate", onMessageCreate);
  discordClient.on("guildMemberRemove", onGuildMemberRemove);
  discordClient.on("guildMemberUpdate", onGuildMemberUpdate);
}
