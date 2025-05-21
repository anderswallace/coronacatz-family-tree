import {
  ChatInputCommandInteraction,
  MessageFlags,
  SlashCommandBuilder,
} from "discord.js";

export const seedCommand = new SlashCommandBuilder()
  .setName("seed")
  .setDescription("Populate DB with seed data");

export async function handleSeedCommand(
  interaction: ChatInputCommandInteraction
) {
  // TODO: Implement seed logic
  const seedMessage = "This command is used to seed the DB";

  await interaction.reply({
    content: seedMessage,
    flags: MessageFlags.Ephemeral,
  });
}
