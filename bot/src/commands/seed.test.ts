import { describe, test, expect, vi, afterEach } from "vitest";
import type { ChatInputCommandInteraction, GuildMember } from "discord.js";
import { MessageFlags } from "discord.js";
import { handleSeedCommand, seedCommand } from "./seed.js";
import type { ServiceContainer } from "../services/index.js";
import { UserAlreadyExistsError } from "../errors/customErrors.js";

vi.mock("../utils/resolveUsernames.js", () => ({
  assignNickname: (m: any) => m.nickname, // passthrough
}));

vi.mock("../data/seedEdges.json", () => ({
  default: [{ parent: "Parent", child: "Child" }],
}));

function fakeMember(nickname: string, id: string, bot = false): GuildMember {
  return {
    nickname,
    user: { id, bot },
  } as unknown as GuildMember;
}

const parentMember = fakeMember("Parent", "parent-id");
const childMember = fakeMember("Child", "child-id");

function memberCollection(...members: GuildMember[]) {
  return members; // sufficient for .filter() & .forEach() inside seed.ts
}

const mockUpload = vi.fn();

const services = {
  databaseService: { uploadNode: mockUpload },
} as unknown as ServiceContainer;

describe("handleSeedCommand", () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  test("handleSeedCommand should have correct metadata", () => {
    expect(seedCommand.name).toBe("seed");
    expect(seedCommand.description).toContain("Populate DB");
  });

  test("handleSeedCommand should block non-admin users", async () => {
    const reply = vi.fn();

    const interaction = {
      user: { id: "not-admin" },
      reply,
    } as unknown as ChatInputCommandInteraction;

    await handleSeedCommand(interaction, "admin-id", services);

    expect(reply).toHaveBeenCalledOnce();
    expect(reply.mock.calls[0][0].flags).toBe(MessageFlags.Ephemeral);
    expect(reply.mock.calls[0][0].content).toContain("do not have access");
    expect(mockUpload).not.toHaveBeenCalled();
  });

  test("handleSeedCommand should handle missing guild", async () => {
    const reply = vi.fn();

    const interaction = {
      user: { id: "admin-id" },
      guild: null,
      reply,
    } as unknown as ChatInputCommandInteraction;

    await handleSeedCommand(interaction, "admin-id", services);

    expect(reply).toHaveBeenCalledOnce();
    expect(reply.mock.calls[0][0].content).toContain("No guild");
  });

  test("handleSeedCommand should upload edges from seed data", async () => {
    const reply = vi.fn();

    const interaction = {
      user: { id: "admin-id" },
      guild: {
        members: {
          fetch: vi
            .fn()
            .mockResolvedValue(memberCollection(parentMember, childMember)),
        },
      },
      reply,
    } as unknown as ChatInputCommandInteraction;

    await handleSeedCommand(interaction, "admin-id", services);

    expect(mockUpload).toHaveBeenCalledOnce();
    expect(mockUpload).toHaveBeenCalledWith("child-id", "parent-id", "Child");

    await vi.waitFor(() => {
      const replyArgs = reply.mock.calls[0][0];
      expect(replyArgs.flags).toBe(MessageFlags.Ephemeral);
      expect(replyArgs.content).toContain("Added 1 new members");
      expect(replyArgs.content).toContain("Total number of users: 2");
    });
  });

  test("handleSeedCommand should ignore UserAlreadyExistsError and report 0 inserts when user is missing from seed data", async () => {
    const reply = vi.fn();

    // uploadNode now rejects with the duplicate-user error
    const duplicateUpload = vi
      .fn()
      .mockRejectedValue(new UserAlreadyExistsError("Child"));

    const dupServices = {
      databaseService: { uploadNode: duplicateUpload },
    } as unknown as ServiceContainer;

    const interaction = {
      user: { id: "admin-id" },
      guild: {
        members: {
          fetch: vi
            .fn()
            .mockResolvedValue(memberCollection(parentMember, childMember)),
        },
      },
      reply,
    } as unknown as ChatInputCommandInteraction;

    await handleSeedCommand(interaction, "admin-id", dupServices);

    // uploadNode was attempted once but duplicate was tolerated
    expect(duplicateUpload).toHaveBeenCalledOnce();

    const replyArgs = reply.mock.calls[0][0];
    expect(replyArgs.content).toContain("Added 0 new members");
  });

  test("handleSeedCommand should not call uploadNode for absent child", async () => {
    const reply = vi.fn();

    // parent exists, child missing
    const interaction = {
      user: { id: "admin-id" },
      guild: {
        members: {
          fetch: vi
            .fn()
            .mockResolvedValue(memberCollection(parentMember /* no child */)),
        },
      },
      reply,
    } as unknown as ChatInputCommandInteraction;

    await handleSeedCommand(interaction, "admin-id", services);

    // nothing inserted, nothing attempted
    expect(mockUpload).not.toHaveBeenCalled();

    const replyArgs = reply.mock.calls[0][0];
    expect(replyArgs.content).toContain("Added 0 new members");
  });

  test("handleSeedCommand should throw an error when it catches error that is not UserAlreadyExistsError", async () => {
    const reply = vi.fn();

    const duplicateUpload = vi
      .fn()
      .mockRejectedValue(new Error("Some other error"));

    const dupServices = {
      databaseService: { uploadNode: duplicateUpload },
    } as unknown as ServiceContainer;

    const interaction = {
      user: { id: "admin-id" },
      guild: {
        members: {
          fetch: vi
            .fn()
            .mockResolvedValue(memberCollection(parentMember, childMember)),
        },
      },
      reply,
    } as unknown as ChatInputCommandInteraction;

    await expect(
      handleSeedCommand(interaction, "admin-id", dupServices)
    ).rejects.toThrow(Error);
  });
});
