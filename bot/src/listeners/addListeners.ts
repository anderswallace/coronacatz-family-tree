import { Client } from "discord.js";
import { onMessageCreate } from "../events/onMessageCreate.js";

export function setupAddListeners(client: Client) {
  client.on("messageCreate", onMessageCreate);
}
