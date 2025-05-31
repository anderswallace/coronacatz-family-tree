import { describe, test, expect, vi, afterEach } from "vitest";
import { ServiceContainer } from "../services/index.js";
import { GuildMember, PartialGuildMember } from "discord.js";

const mockServices = {
  databaseService: {
    updateNode: vi.fn(),
    fetchNodeById: vi.fn(),
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

  test("onGuildMemberUpdate should update a node's name in DB when name has changed", async () => {
    // test here
  });
});
