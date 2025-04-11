import { GuildMember, User, Message, Guild } from "discord.js";
import { afterEach, describe, expect, test, vi } from "vitest";
import { resolveUsernames } from "./resolveUsernames.js";

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
    } as User,
  } as unknown as GuildMember;
}

describe("resolveUsernames", () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  test("Should return two valid nicknames upon successful fetch", async () => {
    const fetch = vi
      .fn()
      .mockReturnValueOnce(
        createMockGuildMember({
          nickname: "child-nickname",
          username: "child-username",
        })
      )
      .mockResolvedValueOnce(
        createMockGuildMember({
          nickname: "parent-nickname",
          username: "parent-username",
        })
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
      childUsername: "child-nickname",
      parentUsername: "parent-nickname",
    });
    expect(fetch).toHaveBeenCalledTimes(2);
  });

  test("Should assign username when nickname and globalName are not present", async () => {
    const fetch = vi
      .fn()
      .mockReturnValueOnce(
        createMockGuildMember({
          username: "child-username",
        })
      )
      .mockResolvedValueOnce(
        createMockGuildMember({
          username: "parent-username",
        })
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

  test("Should return null if fetch fails for one or both users", async () => {
    const fetch = vi
      .fn()
      .mockReturnValueOnce(undefined)
      .mockResolvedValueOnce(
        createMockGuildMember({
          username: "parent-username",
        })
      );
    const mockMessage = {
      guild: {
        members: {
          fetch,
        },
      } as unknown as Guild,
    } as Message;

    const result = await resolveUsernames(mockMessage, "child-id", "parent-id");

    expect(result).toBeNull();
  });
});
