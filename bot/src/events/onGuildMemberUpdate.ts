import { GuildMember, PartialGuildMember } from "discord.js";
import { ServiceContainer } from "../services/index.js";
import { getDisplayName } from "../utils/resolveUsernames.js";
import { UserNotFoundError } from "../errors/customErrors.js";

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

    try {
      // attempt to query user in DB, if they do not exist this will throw an error
      const oldUser = await services.databaseService.fetchNodeById(
        oldMember.user.id,
      );

      // Check if oldMember is a PartialGuildMember (only userId is available)
      // If so, get old name from DB node, otherwise resolve from display name
      const oldName = oldMember.partial
        ? oldUser.name
        : getDisplayName(oldMember);

      // if name is unchanged, return
      if (oldName === newName) {
        return;
      }

      // update new name in DB
      await services.databaseService.updateNode(newMember.user.id, newName);
    } catch (err) {
      // User exists in the server but hasn't been added to the DB yet, no action needed
      if (err instanceof UserNotFoundError) {
        console.log("Ignoring rename of user not in the family tree");
      } else if (err instanceof Error) {
        console.warn(err.message);
      } else {
        console.warn("Unknown error occurred on guildMemberUpdate event");
      }
    }
  };
}
