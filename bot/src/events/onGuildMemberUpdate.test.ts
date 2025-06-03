import { describe, test, expect, vi, afterEach, Mock } from "vitest";
import { ServiceContainer } from "../services/index.js";
import { GuildMember, PartialGuildMember } from "discord.js";
import { createOnGuildMemberUpdate } from "./onGuildMemberUpdate.js";
import { UserNotFoundError } from "../errors/customErrors.js";
import { Node } from "@prisma/client";

const updateNode = vi.fn();
const fetchNodeById = vi.fn();

const mockServices = {
  databaseService: {
    updateNode,
    fetchNodeById,
  },
} as unknown as ServiceContainer;

// Helper to build minimal (Partial) GuildMember stubs
function makeMember(
  id: string,
  name: string,
  { partial = false }: { partial?: boolean } = {},
): GuildMember | PartialGuildMember {
  return {
    user: { id },
    partial,
    displayName: name,
  } as unknown as GuildMember;
}

describe("onGuildMemberUpdate", () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  test("onGuildMemberUpdate should update a node's name in DB when name has changed (GuildMember)", async () => {
    const onGuildMemberUpdate = createOnGuildMemberUpdate(mockServices);

    const mockNode: Node = {
      name: "mock-name",
      userId: "mock-user-id",
      parentId: "mock-parent-id",
      group: "mock-group",
      color: "mock-color",
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // mock old and new member
    const oldMember = makeMember("user-1", "oldName");
    const newMember = makeMember("user-1", "newName");

    (fetchNodeById as Mock).mockResolvedValueOnce(mockNode);

    await onGuildMemberUpdate(oldMember, newMember as GuildMember);

    expect(updateNode).toHaveBeenCalledTimes(1);
    expect(updateNode).toHaveBeenCalledWith(
      newMember.user.id,
      newMember.displayName,
    );
  });

  test("onGuildMemberUpdate should update node's name in DB when name has changed (PartialGuildMember)", async () => {
    const onGuildMemberUpdate = createOnGuildMemberUpdate(mockServices);

    const mockNode: Node = {
      name: "mock-name",
      userId: "mock-user-id",
      parentId: "mock-parent-id",
      group: "mock-group",
      color: "mock-color",
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // mock old and new member, this time old is PartialGuildMember
    const oldMember = makeMember("user-1", "", { partial: true });
    const newMember = makeMember("user-1", "newName");

    (fetchNodeById as Mock).mockResolvedValueOnce(mockNode);

    await onGuildMemberUpdate(oldMember, newMember as GuildMember);

    expect(fetchNodeById).toHaveBeenCalledWith(newMember.user.id);
    expect(updateNode).toHaveBeenCalledTimes(1);
    expect(updateNode).toHaveBeenCalledWith(
      newMember.user.id,
      newMember.displayName,
    );
  });

  test("onGuildMemberUpdate should ignore event when user doesn't exist in family tree", async () => {
    const onGuildMemberUpdate = createOnGuildMemberUpdate(mockServices);

    const oldMember = makeMember("user-1", "oldName");
    const newMember = makeMember("user-1", "newName");

    (fetchNodeById as Mock).mockRejectedValue(
      new UserNotFoundError(newMember.user.id),
    );

    const consoleLogSpy = vi.spyOn(console, "log").mockImplementation(() => {});

    await onGuildMemberUpdate(oldMember, newMember as GuildMember);

    expect(consoleLogSpy).toHaveBeenCalledTimes(1);
    consoleLogSpy.mockRestore();
  });

  test("onGuildMemberUpdate should skip update if name is unchanged", async () => {
    const onGuildMemberUpdate = createOnGuildMemberUpdate(mockServices);

    const mockNode: Node = {
      name: "oldName",
      userId: "mock-user-id",
      parentId: "mock-parent-id",
      group: "mock-group",
      color: "mock-color",
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // mock members with unchanged name
    const oldMember = makeMember("user-1", "", { partial: true });
    const newMember = makeMember("user-1", "oldName");

    (fetchNodeById as Mock).mockResolvedValueOnce(mockNode);

    await onGuildMemberUpdate(oldMember, newMember as GuildMember);

    expect(updateNode).not.toHaveBeenCalled();
  });

  test("onGuildMemberUpdate should catch errors thrown and log a warning", async () => {
    const onGuildMemberUpdate = createOnGuildMemberUpdate(mockServices);

    const mockNode: Node = {
      name: "mock-name",
      userId: "mock-user-id",
      parentId: "mock-parent-id",
      group: "mock-group",
      color: "mock-color",
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const consoleWarnSpy = vi
      .spyOn(console, "warn")
      .mockImplementation(() => {});

    (fetchNodeById as Mock).mockResolvedValueOnce(mockNode);

    updateNode.mockRejectedValue(new Error("DB unavailable"));

    const oldMember = makeMember("user-1", "oldName");
    const newMember = makeMember("user-1", "newName");

    await onGuildMemberUpdate(oldMember, newMember as GuildMember);

    expect(consoleWarnSpy).toHaveBeenCalledWith("DB unavailable");
    consoleWarnSpy.mockRestore();
  });

  test("onGuildMemberUpdate should log unknown error", async () => {
    const onGuildMemberUpdate = createOnGuildMemberUpdate(mockServices);

    const mockNode: Node = {
      name: "mock-name",
      userId: "mock-user-id",
      parentId: "mock-parent-id",
      group: "mock-group",
      color: "mock-color",
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const consoleWarnSpy = vi
      .spyOn(console, "warn")
      .mockImplementation(() => {});

    (fetchNodeById as Mock).mockResolvedValueOnce(mockNode);

    updateNode.mockRejectedValue("Unknown error");

    const oldMember = makeMember("user-1", "oldName");
    const newMember = makeMember("user-1", "newName");

    await onGuildMemberUpdate(oldMember, newMember as GuildMember);

    expect(consoleWarnSpy).toHaveBeenCalledWith(
      "Unknown error occurred on guildMemberUpdate event",
    );
    consoleWarnSpy.mockRestore();
  });
});
