import { GuildMember, User, Message, Guild } from "discord.js";
import { afterEach, describe, expect, test, vi } from "vitest";
import { resolveUsernames } from "./resolveUsernames.js";
import { MESSAGING_ROCKETMQ_MESSAGE_TYPE_VALUE_DELAY } from "@opentelemetry/semantic-conventions/incubating";

// Helper function to mock a GuildMember
function createMockGuildMember({
  nickname,
  globalName,
  username,
}: {
  nickname?: string;
  globalName?: string;
  username: string;
}): GuildMember {
  return {
    nickname,
    user: {
      globalName,
      username,
    } as unknown as User,

    get displayName() {
      return nickname ?? globalName ?? username;
    },
  } as unknown as GuildMember;
}

describe("resolveUsernames", () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  test("resolveUsernames should return two valid nicknames upon successful fetch", async () => {
    const fetch = vi
      .fn()
      .mockReturnValueOnce(
        createMockGuildMember({
          nickname: "child-nickname",
          username: "child-username",
        }),
      )
      .mockResolvedValueOnce(
        createMockGuildMember({
          nickname: "parent-nickname",
          username: "parent-username",
        }),
      );

    const mockMessage = {
      guild: {
        members: {
          fetch,
        },
      } as unknown as Guild,
    } as Message;

    const result = await resolveUsernames(mockMessage, "child-id", "parent-id");

    expect(result).toBeDefined();
    expect(result).toEqual({
      childUsername: "child-nickname",
      parentUsername: "parent-nickname",
    });
    expect(fetch).toHaveBeenCalledTimes(2);
  });

  test("resolveUsername should return null if message was not sent from server", async () => {
    // mock message sent from outside a server
    const mockMessage = {} as Message;

    const result = await resolveUsernames(mockMessage, "child-id", "parent-id");

    expect(result).toBeNull();
  });

  test("resolveUsernames should assign username when nickname and globalName are not present", async () => {
    const fetch = vi
      .fn()
      .mockReturnValueOnce(
        createMockGuildMember({
          username: "child-username",
        }),
      )
      .mockResolvedValueOnce(
        createMockGuildMember({
          username: "parent-username",
        }),
      );

    const mockMessage = {
      guild: {
        members: {
          fetch,
        },
      } as unknown as Guild,
    } as Message;

    const result = await resolveUsernames(mockMessage, "child-id", "parent-id");

    expect(result).toEqual({
      childUsername: "child-username",
      parentUsername: "parent-username",
    });
    expect(fetch).toHaveBeenCalledTimes(2);
  });

  test("resolveUsernames should return null if fetch fails for one or both users", async () => {
    // mock fetch being called 4 times
    const fetch = vi
      .fn()
      .mockReturnValueOnce(undefined)
      .mockResolvedValueOnce(
        createMockGuildMember({
          username: "parent-username",
        }),
      )
      .mockResolvedValueOnce(
        createMockGuildMember({
          username: "child-username",
        }),
      )
      .mockReturnValueOnce(undefined);

    const mockMessage = {
      guild: {
        members: {
          fetch,
        },
      } as unknown as Guild,
    } as Message;

    const result = await resolveUsernames(mockMessage, "child-id", "parent-id");
    expect(result).toBeNull();

    const secondResult = await resolveUsernames(
      mockMessage,
      "child-id",
      "parent-id",
    );
    expect(secondResult).toBeNull();
  });

  test("resolveUsernames should throw an error when fetch fails", async () => {
    const fetch = vi.fn().mockRejectedValueOnce(new Error("Discord Error"));

    const mockMessage = {
      guild: {
        members: {
          fetch,
        },
      } as unknown as Guild,
    } as Message;

    await expect(
      resolveUsernames(mockMessage, "child-id", "parent-id"),
    ).rejects.toThrow(Error);
  });
});
