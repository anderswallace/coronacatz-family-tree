import { describe, test, expect, vi, afterEach } from "vitest";
import { ServiceContainer } from "../services/index.js";
import { GuildMember, PartialGuildMember } from "discord.js";
import { createOnGuildMemberUpdate } from "./onGuildMemberUpdate.js";

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
  } as unknown as GuildMember; // cast keeps the compiler quiet for the test
}

describe("onGuildMemberUpdate", () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  test("onGuildMemberUpdate should update a node's name in DB when name has changed (GuildMember)", async () => {
    const onGuildMemberUpdate = createOnGuildMemberUpdate(mockServices);

    // mock old and new member
    const oldMember = makeMember("user-1", "oldName");
    const newMember = makeMember("user-1", "newName");

    await onGuildMemberUpdate(oldMember, newMember as GuildMember);

    expect(updateNode).toHaveBeenCalledTimes(1);
    expect(updateNode).toHaveBeenCalledWith(
      newMember.user.id,
      newMember.displayName,
    );
    expect(fetchNodeById).not.toHaveBeenCalled();
  });

  test("onGuildMemberUpdate should update node's name in DB when name has changed (PartialGuildMember)", async () => {
    const onGuildMemberUpdate = createOnGuildMemberUpdate(mockServices);

    // mock old and new member, this time old is PartialGuildMember
    const oldMember = makeMember("user-1", "", { partial: true });
    const newMember = makeMember("user-1", "newName");

    await onGuildMemberUpdate(oldMember, newMember as GuildMember);

    expect(fetchNodeById).toHaveBeenCalledWith(newMember.user.id);
    expect(updateNode).toHaveBeenCalledTimes(1);
    expect(updateNode).toHaveBeenCalledWith(
      newMember.user.id,
      newMember.displayName,
    );
  });

  test("onGuildMemberUpdate should return early if name is unchanged", async () => {
    const onGuildMemberUpdate = createOnGuildMemberUpdate(mockServices);

    // mock members with unchanged name
    const oldMember = makeMember("user-1", "oldName");
    const newMember = makeMember("user-1", "oldName");

    await onGuildMemberUpdate(oldMember, newMember as GuildMember);

    expect(fetchNodeById).not.toHaveBeenCalled();
    expect(updateNode).not.toHaveBeenCalled();
  });

  test("onGuildMemberUpdate should catch errors thrown and log a warning", async () => {
    const onGuildMemberUpdate = createOnGuildMemberUpdate(mockServices);

    const consoleWarnSpy = vi
      .spyOn(console, "warn")
      .mockImplementation(() => {});
    updateNode.mockRejectedValue(new Error("DB unavailable"));

    const oldMember = makeMember("user-1", "oldName");
    const newMember = makeMember("user-1", "newName");

    await onGuildMemberUpdate(oldMember, newMember as GuildMember);

    expect(consoleWarnSpy).toHaveBeenCalledWith("DB unavailable");
    consoleWarnSpy.mockRestore();
  });
});
