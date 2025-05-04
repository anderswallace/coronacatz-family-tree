import { describe, expect, test, vi, afterEach, Mock } from "vitest";
import { GuildMember, User } from "discord.js";
import { ServiceContainer } from "../services/index.js";
import { createOnGuildMemberRemove } from "./onGuildMemberRemove.js";

const mockServices = {
  treeService: {
    createNodeFromParent: vi.fn(),
  },
  databaseService: {
    uploadNode: vi.fn(),
    removeNode: vi.fn(),
  },
} as unknown as ServiceContainer;

describe("onGuildMemberRemove", () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  /*test("Should call removeNode when valid user returned", async () => {
    const mockUser = {
      id: "mock-user",
      username: "mock-username",
    } as User;

    const mockGuildMember = {
      user: mockUser,
    } as GuildMember;

    const onGuildMemberRemove = createOnGuildMemberRemove(mockServices);
    await onGuildMemberRemove(mockGuildMember);

    expect(mockServices.databaseService.removeNode).toHaveBeenCalledWith(
      mockUser.id,
    );
  });

  test("Should send warning when no user sent on removeGuildMember event", async () => {
    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
    const mockGuildMember = {} as GuildMember;
    const errorMessage =
      "No user info available for removed member. Skipping DB update.";

    const onGuildMemberRemove = createOnGuildMemberRemove(mockServices);
    await onGuildMemberRemove(mockGuildMember);

    expect(mockServices.databaseService.removeNode).not.toHaveBeenCalled();
    expect(warnSpy).toHaveBeenCalledWith(errorMessage);
  });*/
});
