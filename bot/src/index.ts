import { Client, GatewayIntentBits, TextChannel } from "discord.js";
import dotenv from "dotenv";

dotenv.config();

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

client.once("ready", () => {
  console.log(`Logged in as ${client.user?.tag}`);
});

const TARGET_CHANNEL_NAME = "test-channel";

client.on("messageCreate", async (message) => {
  if (message.author.bot) {
    return;
  }

  const channel = message.channel;
  if (
    channel.type === 0 &&
    (channel as TextChannel).name === TARGET_CHANNEL_NAME
  ) {
    console.log(`Message from ${message.author.username}: ${message.content}`);
    if (message.content === "!hello") {
      await message.reply("Hello from the family tree bot");
    }
  }
});

client.login(process.env.DISCORD_TOKEN);
