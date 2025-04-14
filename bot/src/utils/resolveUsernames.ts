import { Message } from "discord.js";

export async function resolveUsernames(
  message: Message,
  childId: string,
  parentId: string
): Promise<{ childUsername: string; parentUsername: string } | null> {
  // verify message isn't a private message
  const guild = message.guild;
  if (!guild) {
    return null;
  }

  const childUser = await message.guild.members.fetch(childId);
  const parentUser = await message.guild.members.fetch(parentId);

  if (childUser === undefined || parentUser === undefined) {
    return null;
  }

  // Assign most human name to users being added to tree
  const childUsername =
    childUser.nickname ?? childUser.user.globalName ?? childUser.user.username;
  const parentUsername =
    parentUser.nickname ??
    parentUser.user.globalName ??
    parentUser.user.username;

  return { childUsername, parentUsername };
}
