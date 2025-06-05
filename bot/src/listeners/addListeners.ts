import { Client } from "discord.js";
import { createOnMessageCreate } from "../events/onMessageCreate.js";
import { createOnGuildMemberRemove } from "../events/onGuildMemberRemove.js";
import { ServiceContainer } from "../services/index.js";
import { createOnGuildMemberUpdate } from "../events/onGuildMemberUpdate.js";
import { DiscordChannel } from "../types/discord.js";

/**
 * Sets up event listeners for emitted Discord events
 *
 * @param discordClient - Client for interacting with Discord API
 * @param services - Container for services utilized by event handlers
 * @param channelName - The target channel for onMessageCreate event
 */
export function setupAddListeners(
  discordClient: Client,
  services: ServiceContainer,
  channelName: DiscordChannel,
) {
  const onMessageCreate = createOnMessageCreate(services, channelName);
  const onGuildMemberRemove = createOnGuildMemberRemove(services);
  const onGuildMemberUpdate = createOnGuildMemberUpdate(services);

  discordClient.on("messageCreate", onMessageCreate);
  discordClient.on("guildMemberRemove", onGuildMemberRemove);
  discordClient.on("guildMemberUpdate", onGuildMemberUpdate);
}
