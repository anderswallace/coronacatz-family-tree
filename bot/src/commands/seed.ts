import {
  ChatInputCommandInteraction,
  GuildMember,
  MessageFlags,
  SlashCommandBuilder
} from "discord.js";
import { assignNickname } from "../utils/resolveUsernames.js";
import { ServiceContainer } from "../services/index.js";
import seedEdges from "../data/seedEdges.json" with { type: "json" };
import { UserAlreadyExistsError } from "../errors/customErrors.js";

export const seedCommand = new SlashCommandBuilder()
  .setName("seed")
  .setDescription("Populate DB with seed data. For DB Admin use only.");

export async function handleSeedCommand(
  interaction: ChatInputCommandInteraction,
  admin: string,
  services: ServiceContainer
) {
  // Only allow specified admin to use seed command
  if (interaction.user.id !== admin) {
    await interaction.reply({
      content: "You do not have access to this command",
      flags: MessageFlags.Ephemeral
    });
    return;
  }

  const guild = interaction.guild;
  if (!guild) {
    await interaction.reply({
      content: "Unable to seed DB: No guild information available",
      flags: MessageFlags.Ephemeral
    });
    return;
  }

  // Return all members of the server, create map to lookup user by nickname
  const rawMembers = await guild.members.fetch();
  const members = new Map<string, GuildMember>();

  // Filter out bot users to get human GuildMembers of the server
  rawMembers
    .filter((member) => !member.user.bot)
    .forEach((member) => members.set(assignNickname(member), member));

  // Upload edges from seedEdges and return number of added members
  const insertedMembers = uploadSeedEdges(services, members);

  await interaction.reply({
    content: `DB seed complete. Added ${insertedMembers} new members. Total number of users: ${members.size}`,
    flags: MessageFlags.Ephemeral
  });
}

// Helper function to extract user information from server list to seed the DB from seedEdges
// Returns the number of added members
async function uploadSeedEdges(
  services: ServiceContainer,
  members: Map<string, GuildMember>
): Promise<number> {
  let inserted = 0;
  let skipped = 0;

  // Loop over seed data and extract matching GuildMembers from the server to be uploaded to the DB
  for (const { parent, child } of seedEdges as {
    parent: string;
    child: string;
  }[]) {
    // Retrieve GuildMember from server list
    const parentMember = members.get(parent);
    const childMember = members.get(child);

    if (!parentMember || !childMember) {
      console.warn(`[seed] Skip ${parent} => ${child} (member missing)`);
      skipped++;
      continue;
    }

    try {
      await services.databaseService.uploadNode(
        childMember.user.id,
        parentMember.user.id,
        child
      );
      inserted++;
    } catch (err) {
      if (!(err instanceof UserAlreadyExistsError)) {
        throw err;
      }
    }
  }

  console.warn(`Warning: ${skipped} users skipped in seeding`);

  return inserted;
}
