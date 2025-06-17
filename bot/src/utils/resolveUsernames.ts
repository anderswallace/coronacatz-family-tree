import { Message } from "discord.js";
import { tracer } from "../telemetry/tracing.js";
import { SpanStatusCode } from "@opentelemetry/api";

/**
 * Resolves the display names of two User IDs from Discord message
 *
 * If message is a DM (Direct Message), or the users are not found in the server
 * it returns null
 *
 * @param message - Message emitted by Discord
 * @param childId - Discord User ID of child user
 * @param parentId - Discord User ID of parent user
 * @returns The display names of the child and parent User IDs
 */
export async function resolveUsernames(
  message: Message,
  childId: string,
  parentId: string,
): Promise<{ childUsername: string; parentUsername: string } | null> {
  // Root span for resolveUsernames
  return tracer.startActiveSpan(
    "resolveUsernames",
    {
      attributes: {
        "discord.message": message.content,
        "app.child_id": childId,
        "app.parent_id": parentId,
      },
    },
    async (span) => {
      try {
        const childUser = await fetchGuildMember(message, childId);
        const parentUser = await fetchGuildMember(message, parentId);

        if (childUser === null || parentUser === null) {
          return null;
        }

        const childUsername = childUser.displayName;
        const parentUsername = parentUser.displayName;

        span.setStatus({ code: SpanStatusCode.OK });
        return { childUsername, parentUsername };
      } catch (error) {
        span.recordException(error as Error);
        span.setStatus({
          code: SpanStatusCode.ERROR,
          message: (error as Error).message,
        });
        throw error;
      } finally {
        span.end();
      }
    },
  );
}

/**
 * Utility to extract a GuildMember (Server specific user reference) from a Discord server
 * message using a User ID (Global user reference)
 *
 * If message is a DM (Direct Message), or the user is not found in the server
 * it returns null
 *
 * @param message - Message emitted by discord
 * @param userId - Discord User ID of GuildMember to fetch
 * @returns GuildMember from server with matching {@link userId}
 */
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
