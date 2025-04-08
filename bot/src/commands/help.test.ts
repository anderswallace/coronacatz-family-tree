import { describe, expect, test, vi } from "vitest";
import { handleHelpCommand } from "./help.js";
import { afterEach } from "node:test";
import { ChatInputCommandInteraction } from "discord.js";

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

    expect(replyArgs.ephemeral).toBe(true);
    expect(replyArgs.content).toContain("Family Tree Bot Help");
    expect(replyArgs.content).toContain(
      "@FamilyTreeBot please add @Jared to @Joel"
    );
  });
});
