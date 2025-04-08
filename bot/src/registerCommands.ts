import { REST, Routes, SlashCommandBuilder } from "discord.js";
import { helpCommand } from "./commands/help.js";
import { config } from "./config.js";

const commands: SlashCommandBuilder[] = [helpCommand];

export async function registerSlashCommands() {
  const rest = new REST({ version: "10" }).setToken(config.discordToken);

  try {
    console.log("Registering slash commands...");

    await rest.put(Routes.applicationCommands(config.clientId), {
      body: commands.map((cmd) => cmd.toJSON()),
    });

    console.log("Slash commands registered.");
  } catch (err) {
    console.error("Failed to register commands: ", err);
  }
}
