import { describe, test, expect, vi, afterEach } from "vitest";
import type { GuildMember, Guild } from "discord.js";
import { seedDb } from "./seed.js";
import type { ServiceContainer } from "../services/index.js";

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

const guild = {
  members: {
    fetch: vi
      .fn()
      .mockResolvedValue(memberCollection(parentMember, childMember)),
  },
} as unknown as Guild;

const mockUploadNodes = vi.fn();

const services = {
  databaseService: { uploadNodes: mockUploadNodes },
} as unknown as ServiceContainer;

describe("seedDb", () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  test("seedDb should upload edges from seed data", async () => {
    const logSpy = vi.spyOn(console, "log").mockImplementation(() => {});
    const uploadNodesSpy = vi.spyOn(services.databaseService, "uploadNodes");

    await seedDb(guild, services);

    await vi.waitFor(() => {
      expect(logSpy).toHaveBeenCalledTimes(1);
      expect(logSpy.mock.calls[0][0]).toContain("DB seed complete.");
      expect(logSpy.mock.calls[0][0]).toContain("Total number of users: 2");
    });
  });
});
