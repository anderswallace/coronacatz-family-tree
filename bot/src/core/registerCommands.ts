import { REST, Routes, SlashCommandBuilder } from "discord.js";
import { helpCommand } from "../commands/help.js";
import { seedCommand } from "../commands/seed.js";

const commands: SlashCommandBuilder[] = [helpCommand, seedCommand];

export async function registerSlashCommands(
  discordToken: string,
  clientId: string
) {
  const rest = new REST({ version: "10" }).setToken(discordToken);

  try {
    console.log("Registering slash commands...");

    await rest.put(Routes.applicationCommands(clientId), {
      body: commands.map((cmd) => cmd.toJSON()),
    });

    console.log("Slash commands registered.");
  } catch (err) {
    console.error("Failed to register commands: ", err);
  }
}
