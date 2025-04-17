import { GuildMember, Message, MessageFlagsBitField } from "discord.js";

export async function resolveUsernames(
  message: Message,
  childId: string,
  parentId: string
): Promise<{ childUsername: string; parentUsername: string } | null> {
  const childUser = await fetchUser(message, childId);
  const parentUser = await fetchUser(message, parentId);

  if (childUser === null || parentUser === null) {
    return null;
  }

  const childUsername = assignNickname(childUser);
  const parentUsername = assignNickname(parentUser);

  return { childUsername, parentUsername };
}

async function fetchUser(message: Message, userId: string) {
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

function assignNickname(user: GuildMember): string {
  return user.nickname ?? user.user.globalName ?? user.user.username;
}
