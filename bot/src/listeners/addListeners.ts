import { Client } from "discord.js";
import { createOnMessageCreate } from "../events/onMessageCreate.js";
import { Database } from "firebase/database";

export function setupAddListeners(
  client: Client,
  database: Database,
  channelName: string
) {
  const onMessageCreate = createOnMessageCreate(database, channelName);
  client.on("messageCreate", onMessageCreate);
}
