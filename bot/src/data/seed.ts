import { Guild, GuildMember } from "discord.js";
import { assignNickname } from "../utils/resolveUsernames.js";
import { ServiceContainer } from "../services/index.js";
import seedEdges from "../data/seedEdges.json" with { type: "json" };
import { UserAlreadyExistsError } from "../errors/customErrors.js";

export async function seedDb(guild: Guild, services: ServiceContainer) {
  // Return all members of the server, create map to lookup user by nickname
  const rawMembers = await guild.members.fetch();
  const members = new Map<string, GuildMember>();

  // Filter out bot users to get human GuildMembers of the server
  rawMembers
    .filter((member) => !member.user.bot)
    .forEach((member) => members.set(assignNickname(member), member));

  // Upload edges from seedEdges and return number of added members
  const insertedMembers = await uploadSeedEdges(services, members);

  console.log(
    `DB seed complete. Added ${insertedMembers} new members. Total number of users: ${members.size}`
  );
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
      console.warn(`[seed] Skipping ${parent} => ${child} (member missing)`);
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

  if (skipped > 0) {
    console.warn(`Warning: ${skipped} users skipped in seeding`);
  }

  return inserted;
}
