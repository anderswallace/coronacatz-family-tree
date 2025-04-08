import { ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js";

export const helpCommand = new SlashCommandBuilder()
  .setName("help")
  .setDescription("Shows how to interact with the family tree bot");

export async function handleHelpCommand(
  interaction: ChatInputCommandInteraction
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
    ephemeral: true,
  });
}
