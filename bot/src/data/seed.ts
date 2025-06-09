import { Guild, GuildMember } from "discord.js";
import { ServiceContainer } from "../services/index.js";
import seedEdges from "../data/seedEdges.json" with { type: "json" };
import { Edge, ConstructedEdge } from "../types/graph.js";

/**
 * Seeds Supabase DB with predefined relationships from seedEdges.json
 *
 * @param guild - A server on Discord to seed
 * @param services - Container for services utilized by the bot
 */
export async function seedDb(guild: Guild, services: ServiceContainer) {
  // Return all members of the server, create map to lookup user by nickname
  const rawMembers = await guild.members.fetch();
  const members = new Map<string, GuildMember>();

  // Filter out bot users to get human GuildMembers of the server
  rawMembers
    .filter((member) => !member.user.bot)
    .forEach((member) => members.set(member.displayName, member));

  // Upload edges from seedEdges and return number of added members
  const insertedMembers = await uploadSeedEdges(services, members);

  console.log(
    `DB seed complete. Added ${insertedMembers} new members. Total number of users: ${members.size}`
  );
}

/**
 * Helper function to match seed data users to the server GuildMembers and upload valid edges to the DB
 *
 * @param services - Container for services utilized by the bot
 * @param members - All GuildMembers of the server
 * @returns Number of edges added to the DB
 */
async function uploadSeedEdges(
  services: ServiceContainer,
  members: Map<string, GuildMember>
): Promise<number> {
  let skipped = 0;
  const edges: ConstructedEdge[] = [];

  const simpleEdges: Edge[] = seedEdges;

  // Loop over seed data and extract matching GuildMembers from the server to be uploaded to the DB
  for (const { parent, child } of simpleEdges) {
    // Retrieve GuildMember from server list
    const parentMember = members.get(parent);
    const childMember = members.get(child);

    // log any members who are in seed data but not in the server
    if (!parentMember || !childMember) {
      console.warn(`[seed] Skipping ${parent} => ${child} (member missing)`);
      skipped++;
      continue;
    }

    // add edge to batch to be uploaded
    edges.push({
      childId: childMember.user.id,
      parentId: parentMember.user.id,
      name: child,
    });
  }

  if (skipped > 0) {
    console.warn(`Warning: ${skipped} users skipped in seeding`);
  }

  // perform single batch upload operation
  return services.databaseService.uploadNodes(edges);
}
