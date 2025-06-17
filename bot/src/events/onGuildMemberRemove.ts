import { GuildMember, PartialGuildMember } from "discord.js";
import { ServiceContainer } from "../services/index.js";
import { tracer } from "../telemetry/tracing.js";
import { logs, SeverityNumber } from "@opentelemetry/api-logs";
import { SpanStatusCode } from "@opentelemetry/api";

const logger = logs.getLogger("guildMemberRemove");

/**
 * Factory that returns a 'guildMemberRemove' event listener
 *
 * The returned callback removes the GuildMember who is no longer in the server from
 * the DB
 *
 * @param services - Container for services utilized by the bot
 * @returns An async callback to handle the 'guildMemberRemove' event
 */
export function createOnGuildMemberRemove(services: ServiceContainer) {
  return async function onGuildMemberRemove(
    member: GuildMember | PartialGuildMember,
  ) {
    await tracer.startActiveSpan(
      "guildMemberRemove",
      {
        attributes: {
          "discord.user_id": member.user.id,
        },
      },
      async (span) => {
        try {
          // Remove node from DB
          await services.databaseService.removeNode(member.user.id);

          // Record OK status in trace and logs
          span.setStatus({ code: SpanStatusCode.OK });
          logger.emit({
            body: `guildMemberRemove: User ${member.user.id} removed from DB`,
            attributes: { userId: member.user.id },
            severityNumber: SeverityNumber.INFO,
          });
        } catch (err) {
          // Record error in logs
          if (err instanceof Error) {
            logger.emit({
              body: `guildMemberRemove: ${err.message}`,
              attributes: { userId: member.user.id },
              severityNumber: SeverityNumber.ERROR,
            });
          } else {
            const error = new Error("Unknown error occurred");

            logger.emit({
              body: `guildMemberRemove: ${error.message}`,
              attributes: { userId: member.user.id },
              severityNumber: SeverityNumber.ERROR2,
            });
          }
        } finally {
          span.end();
        }
      },
    );
  };
}
