import { describe, expect, test, vi, afterEach } from "vitest";
import { handleHelpCommand } from "./help.js";
import { ChatInputCommandInteraction } from "discord.js";
import { helpCommand } from "./help.js";
import { MessageFlags } from "discord.js";

describe("handleHelpCommand", () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  test("Should reply with help message and make it ephemeral", async () => {
    const mockReply = vi.fn();

    const mockInteraction: ChatInputCommandInteraction = {
      reply: mockReply,
    } as unknown as ChatInputCommandInteraction;

    await handleHelpCommand(mockInteraction);

    expect(mockReply).toHaveBeenCalledOnce();

    // First call, first argument
    const replyArgs = mockReply.mock.calls[0][0];

    expect(replyArgs.flags).toBe(MessageFlags.Ephemeral);
    expect(replyArgs.content).toContain("Family Tree Bot Help");
    expect(replyArgs.content).toContain(
      "@FamilyTreeBot please add @Jared to @Joel"
    );
  });

  test("Should create helpCommand with proper name and description", () => {
    expect(helpCommand.name).toBe("help");
    expect(helpCommand.description).toBe(
      "Shows how to interact with the family tree bot"
    );
  });
});
