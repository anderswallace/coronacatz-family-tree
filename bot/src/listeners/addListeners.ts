import { Client } from "discord.js";
import { createOnMessageCreate } from "../events/onMessageCreate.js";

export function setupAddListeners(client: Client, channelName: string) {
  const onMessageCreate = createOnMessageCreate(channelName);
  client.on("messageCreate", onMessageCreate);
}
