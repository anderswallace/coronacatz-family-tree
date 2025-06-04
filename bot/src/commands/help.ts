import {
  ChatInputCommandInteraction,
  MessageFlags,
  SlashCommandBuilder,
} from "discord.js";

export const helpCommand = new SlashCommandBuilder()
  .setName("help")
  .setDescription("Shows how to interact with the family tree bot");

/**
 * Slash command to handle /help interaction with the bot
 *
 * Creates an ephemeral reply in the channel with instructions on
 * how to use the bot
 *
 * @param interaction
 */
export async function handleHelpCommand(
  interaction: ChatInputCommandInteraction,
) {
  const helpMessage = `
   **Family Tree Bot Help**
   
   To add someone to the family tree, just type:

   \`please add @User1 to @User2\`

   **Example:**
   \`@FamilyTreeBot please add @Jared to @Joel\`
    `;

  await interaction.reply({
    content: helpMessage,
    flags: MessageFlags.Ephemeral,
  });
}
