import {
  ChatInputCommandInteraction,
  MessageFlags,
  SlashCommandBuilder,
} from "discord.js";
import { assignNickname } from "../utils/resolveUsernames.js";

export const seedCommand = new SlashCommandBuilder()
  .setName("seed")
  .setDescription("Populate DB with seed data. For DB Admin use only.");

export async function handleSeedCommand(
  interaction: ChatInputCommandInteraction,
  admin: string
) {
  // TODO: Import seed data

  // Only allow specified admin to use seed command
  if (interaction.user.id !== admin) {
    await interaction.reply({
      content: "You do not have access to this command",
      flags: MessageFlags.Ephemeral,
    });
    return;
  }

  const guild = interaction.guild;
  if (!guild) {
    await interaction.reply({
      content: "Unable to seed DB: No guild information available",
      flags: MessageFlags.Ephemeral,
    });
    return;
  }

  const rawMembers = await guild.members.fetch();

  // Filter out bot users and guild information to get all guild members of the server
  const guildMembers = rawMembers.filter((member) => !member.user.bot);

  guildMembers.forEach((member) => {
    const memberNickname = assignNickname(member);
    console.log(member.user.id, memberNickname);
  });

  await interaction.reply({
    content: "DB seeded.",
    flags: MessageFlags.Ephemeral,
  });
}
