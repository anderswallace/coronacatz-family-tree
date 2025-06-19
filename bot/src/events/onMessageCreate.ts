import { Message, TextChannel } from "discord.js";
import { parseAddMessage } from "../utils/parseAddMessage.js";
import { resolveUsernames } from "../utils/resolveUsernames.js";
import { ServiceContainer } from "../services/index.js";
import { DiscordChannel } from "../types/discord.js";
import { tracer } from "../telemetry/tracing.js";
import { logs, SeverityNumber } from "@opentelemetry/api-logs";
import { SpanStatusCode } from "@opentelemetry/api";

const logger = logs.getLogger("messageCreate");

/**
 * Factory that creates an 'onMessageCreate' event listener
 *
 * The returned callback parses new messages in the target channel to upload new Discord users
 * to the family tree
 *
 * @param services - Container for services utilized by the bot
 * @param targetChannelName - The specified channel name the bot parses new messages
 * @returns An async callback to handle the 'messageCreate' event
 */
export function createOnMessageCreate(
  services: ServiceContainer,
  targetChannelName: DiscordChannel,
) {
  return async function onMessageCreate(message: Message) {
    // Root span for messageCreate event
    await tracer.startActiveSpan(
      "messageCreate",
      {
        attributes: {
          "discord.message_content": message.content,
          "discord.message_author": message.author.displayName,
        },
      },
      async (span) => {
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
          const resolvedNames = await resolveUsernames(
            message,
            childId,
            parentId,
          );
          if (!resolvedNames) {
            await channel.send(
              "One or more users couldn't be found. Please try again",
            );
            return;
          }

          const { childUsername, parentUsername } = resolvedNames;

          await services.databaseService.uploadNode(
            childId,
            parentId,
            childUsername,
          );

          // Record successful execution
          span.setStatus({ code: SpanStatusCode.OK });
          logger.emit({
            body: `[SUCCESS] messageCreate: User [${childUsername}] added under [${parentUsername}]`,
            severityNumber: SeverityNumber.INFO,
          });

          await channel.send(
            `Family tree updated! Added ${childUsername} to ${parentUsername}`,
          );
        } catch (error) {
          // Log error in trace
          span.recordException(error as Error);
          span.setStatus({
            code: SpanStatusCode.ERROR,
            message: (error as Error).message,
          });

          if (error instanceof Error) {
            logger.emit({
              body: `[ERROR] messageCreate: ${error.message}`,
              severityNumber: SeverityNumber.ERROR,
            });
            await channel.send(`**ERROR**: ${error.message}`);
          } else {
            logger.emit({
              body: "[ERROR] messageCreate: Unknown error occurred",
              severityNumber: SeverityNumber.ERROR2,
            });
            await channel.send("Unknown error.");
          }
        } finally {
          span.end();
        }
      },
    );
  };
}
