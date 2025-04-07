import dotenv from "dotenv";
import { client } from "./client.js";
import { setupEvents } from "./events.js";

dotenv.config();

client.once("ready", () => {
  console.log(`Logged in as ${client.user?.tag}`);
});

setupEvents(client);
client.login(process.env.DISCORD_TOKEN);
