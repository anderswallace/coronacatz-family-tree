import { GuildMember, PartialGuildMember } from "discord.js";
import { ServiceContainer } from "../services/index.js";
import { getDisplayName } from "../utils/resolveUsernames.js";

/**
 * Factory that creates a 'guildMemberUpdate' event listener
 *
 * The returned callback updates user entries in the DB to reflect any display name changes in the Discord server
 *
 * @param services - A ServiceContainer that provides the callback with access to 'databaseService'
 *
 * @returns An async callback to handle the 'onGuildMemberUpdate' event
 */
export function createOnGuildMemberUpdate(services: ServiceContainer) {
  return async function onGuildMemberUpdate(
    oldMember: GuildMember | PartialGuildMember,
    newMember: GuildMember,
  ) {
    // resolve display name of new user as they may not have nickname assigned
    const newName = getDisplayName(newMember);

    // Check if oldMember is a PartialGuildMember (only userId is available)
    // If so, get old name from DB, otherwise resolve from display name
    const oldName = oldMember.partial
      ? await services.databaseService.fetchNodeById(oldMember.user.id)
      : getDisplayName(oldMember);

    // if name is unchanged, return
    if (oldName === newName) {
      return;
    }

    // update new name in DB
    try {
      await services.databaseService.updateNode(newMember.user.id, newName);
    } catch (err) {
      if (err instanceof Error) {
        console.warn(err.message);
      }
    }
  };
}
