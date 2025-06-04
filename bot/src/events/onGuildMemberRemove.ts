import { GuildMember, PartialGuildMember } from "discord.js";
import { ServiceContainer } from "../services/index.js";

/**
 * Factory that returns a 'guildMemberRemove' event listener
 *
 * The returned callback removes the GuildMember who is no longer in the server from
 * the DB
 *
 * @param services
 * @returns An async callback to handle the 'guildMemberRemove' event
 */
export function createOnGuildMemberRemove(services: ServiceContainer) {
  return async function onGuildMemberRemove(
    member: GuildMember | PartialGuildMember,
  ) {
    const user = member.user;

    if (!user) {
      console.warn(
        "No user info available for removed member. Skipping DB update.",
      );
      return;
    }

    await services.databaseService.removeNode(user.id);
  };
}
