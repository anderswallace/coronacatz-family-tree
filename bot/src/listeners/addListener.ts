import { Client, Message, TextChannel } from "discord.js";

const TARGET_CHANNEL_NAME = "family-tree";

export function setupAddListener(client: Client) {
  // Trigger parsing when user sends a message in a channel
  client.on("messageCreate", async (message: Message) => {
    try {
      if (message.author.bot) {
        return;
      }

      const content = message.content.toLowerCase();

      const channel = message.channel as TextChannel;
      if (channel.name === TARGET_CHANNEL_NAME) {
        // Parse message for 'Add @User1 to @User2' structure
        const match = content.match(/add\s+<@!?(\d+)>\s+to\s+<@!?(\d+)>/i);
        if (!match) {
          return;
        }

        const childId = match[1];
        const parentId = match[2];

        // Return Discord IDs of mentioned users
        const childUser = await message.guild?.members.fetch(childId);
        const parentUser = await message.guild?.members.fetch(parentId);

        if (childUser === undefined || parentUser === undefined) {
          channel.send(
            "One or more users couldn't be found. Please try again."
          );
          message.delete();
          return;
        }

        // Assign most human name before updating tree
        const childUsername =
          childUser.nickname ??
          childUser.user.globalName ??
          childUser.user.username;
        const parentUsername =
          parentUser.nickname ??
          parentUser.user.globalName ??
          parentUser.user.username;

        channel.send(
          `Updated family tree! Added ${childUsername} to ${parentUsername}`
        );
        await message.delete();
      }
    } catch (error) {
      if (error instanceof Error) {
        (message.channel as TextChannel).send(`Error: ${error.message}`);
        await message.delete();
      } else {
        (message.channel as TextChannel).send("Unknown error.");
        await message.delete();
      }
    }
  });
}
