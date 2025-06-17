import { GuildMember, PartialGuildMember } from "discord.js";
import { ServiceContainer } from "../services/index.js";
import { UserNotFoundError } from "../errors/customErrors.js";
import { SpanStatusCode } from "@opentelemetry/api";
import { tracer } from "../telemetry/tracing.js";
import { logs, SeverityNumber } from "@opentelemetry/api-logs";

const logger = logs.getLogger("guildMemberUpdate");

/**
 * Factory that creates an 'onGuildMemberUpdate' event listener
 *
 * The returned callback updates user entries in the DB to reflect any display name changes in the Discord server
 *
 * @param services - Container for services utilized by the bot
 * @returns An async callback to handle the 'guildMemberUpdate' event
 */
export function createOnGuildMemberUpdate(services: ServiceContainer) {
  return async function onGuildMemberUpdate(
    oldMember: GuildMember | PartialGuildMember,
    newMember: GuildMember,
  ) {
    // Root span for guildMemberUpdate event
    await tracer.startActiveSpan(
      "guildMemberUpdate",
      {
        attributes: {
          "discord.user_id": newMember.id,
          "discord.user_newName": newMember.displayName,
        },
      },
      async (span) => {
        try {
          // resolve display name of new user as they may not have nickname assigned
          const newName = newMember.displayName;

          // attempt to query user in DB, if they do not exist this will throw an error
          const oldUser = await services.databaseService.fetchNodeById(
            oldMember.user.id,
          );

          // Check if oldMember is a PartialGuildMember (only userId is available)
          // If so, get old name from DB node, otherwise resolve from display name
          const oldName = oldMember.partial
            ? oldUser.name
            : oldMember.displayName;

          // if name is unchanged, return
          if (oldName === newName) {
            return;
          }

          // update new name in DB
          await services.databaseService.updateNode(newMember.user.id, newName);

          // Record successful execution
          span.setStatus({ code: SpanStatusCode.OK });
          logger.emit({
            body: `guildMemberUpdate: User [${oldName}] renamed to [${newName}]`,
            severityNumber: SeverityNumber.INFO,
            attributes: { oldName, newName },
          });
        } catch (err) {
          // Log error in trace
          span.recordException(err as Error);
          span.setStatus({
            code: SpanStatusCode.ERROR,
            message: (err as Error).message,
          });

          // User exists in the server but hasn't been added to the DB yet, no action needed
          if (err instanceof UserNotFoundError) {
            console.log("Ignoring rename of user not in the family tree");
            logger.emit({
              body: `guildMemberUpdate: User ${newMember.displayName} rename ignored, not yet in database`,
              severityNumber: SeverityNumber.INFO,
            });
          } else if (err instanceof Error) {
            console.warn(err.message);
            logger.emit({
              body: `guildMemberUpdate: ${err.message}`,
              severityNumber: SeverityNumber.ERROR,
            });
          } else {
            console.warn("Unknown error occurred on guildMemberUpdate event");
            logger.emit({
              body: "guildMemberUpdate: Unknown error occurred",
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
