import { GuildMember, PartialGuildMember } from "discord.js";
import { ServiceContainer } from "../services/index.js";

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

    //await services.databaseService.removeNode(user.id);
  };
}
