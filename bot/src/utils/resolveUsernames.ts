import { GuildMember, Message } from "discord.js";

export async function resolveUsernames(
  message: Message,
  childId: string,
  parentId: string,
): Promise<{ childUsername: string; parentUsername: string } | null> {
  const childUser = await fetchGuildMember(message, childId);
  const parentUser = await fetchGuildMember(message, parentId);

  if (childUser === null || parentUser === null) {
    return null;
  }

  const childUsername = childUser.displayName;
  const parentUsername = parentUser.displayName;

  return { childUsername, parentUsername };
}

async function fetchGuildMember(message: Message, userId: string) {
  // verify message isn't a private message
  const guild = message.guild;
  if (!guild) {
    return null;
  }

  const discordUser = await message.guild.members.fetch(userId);

  if (discordUser === undefined) {
    return null;
  }
  return discordUser;
}
