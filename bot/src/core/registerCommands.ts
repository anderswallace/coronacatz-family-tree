import { REST, Routes, SlashCommandBuilder } from "discord.js";
import { helpCommand } from "../commands/help.js";

const commands: SlashCommandBuilder[] = [helpCommand];

/**
 * Registers bot's slash commands with Discord
 *
 * @param discordToken - Discord API Token
 * @param clientId - Bot Client ID assigned by Discord
 */
export async function registerSlashCommands(
  discordToken: string,
  clientId: string,
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
