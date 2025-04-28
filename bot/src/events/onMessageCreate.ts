import { Message, TextChannel } from "discord.js";
import { parseAddMessage } from "../utils/parseAddMessage.js";
import { resolveUsernames } from "../utils/resolveUsernames.js";
import { ServiceContainer } from "../services/index.js";

export function createOnMessageCreate(
  services: ServiceContainer,
  targetChannelName: string,
) {
  return async function onMessageCreate(message: Message) {
    const channel = message.channel as TextChannel;
    if (channel.name !== targetChannelName) {
      return;
    }

    try {
      if (message.author.bot) {
        return;
      }

      // Parse user IDs from message
      const parsedUsers = parseAddMessage(message.content);
      if (!parsedUsers) {
        return;
      }

      const { childId, parentId } = parsedUsers;

      // Return usernames from user IDs
      const resolvedNames = await resolveUsernames(message, childId, parentId);
      if (!resolvedNames) {
        await channel.send(
          "One or more users couldn't be found. Please try again",
        );
        return;
      }

      const { childUsername, parentUsername } = resolvedNames;

      const childNode = await services.treeService.createNodeFromParent(
        childId,
        childUsername,
        parentId,
      );
      await services.databaseService.uploadNode(childNode);

      await channel.send(
        `Family tree updated! Added ${childUsername} to ${parentUsername}`,
      );
      await message.delete();
    } catch (error) {
      if (error instanceof Error) {
        await channel.send(`Error: ${error.message}`);
        await message.delete();
      } else {
        await channel.send("Unknown error.");
        await message.delete();
      }
    }
  };
}
