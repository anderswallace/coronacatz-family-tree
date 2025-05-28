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

const guild = {
  members: {
    fetch: vi.fn().mockResolvedValue([parentMember, childMember]),
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

  test("seedDb should call uploadNodes with the constructed edge list", async () => {
    const uploadNodesSpy = vi.spyOn(services.databaseService, "uploadNodes");
    const logSpy = vi.spyOn(console, "log").mockImplementation(() => {});

    await seedDb(guild, services);

    expect(uploadNodesSpy).toHaveBeenCalledTimes(1);
    expect(uploadNodesSpy.mock.calls[0][0]).toEqual([
      {
        childId: "child-id",
        parentId: "parent-id",
        name: "Child",
      },
    ]);
    await vi.waitFor(() => {
      expect(logSpy).toHaveBeenCalledTimes(1);
      expect(logSpy.mock.calls[0][0]).toContain("DB seed complete.");
      expect(logSpy.mock.calls[0][0]).toContain("Total number of users: 2");
    });
  });

  test("seedDb should skip edges whose members are missing and log a warning", async () => {
    // guild only contains Parent (no Child) - edge is skipped
    const incompleteGuild = {
      members: {
        fetch: vi.fn().mockResolvedValue([parentMember]),
      },
    } as unknown as Guild;

    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
    const uploadNodesSpy = vi.spyOn(services.databaseService, "uploadNodes");

    await seedDb(incompleteGuild, services);

    expect(warnSpy).toHaveBeenCalledWith(
      expect.stringContaining("[seed] Skipping Parent => Child")
    );
    expect(warnSpy).toHaveBeenCalledWith(
      expect.stringContaining("users skipped")
    );
    expect(uploadNodesSpy).toHaveBeenCalledWith([]); // nothing inserted
  });

  test("seedDb should filter out bot users before constructing edges", async () => {
    const botChild = fakeMember("Child", "child-id", true); // bot flag set to true

    const botGuild = {
      members: {
        fetch: vi.fn().mockResolvedValue([parentMember, botChild]),
      },
    } as unknown as Guild;

    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
    const uploadNodesSpy = vi.spyOn(services.databaseService, "uploadNodes");

    await seedDb(botGuild, services);

    // because Child is a bot, nickname-lookup fails - edge skipped
    expect(uploadNodesSpy).toHaveBeenCalledWith([]);
    expect(warnSpy).toHaveBeenCalledWith(
      expect.stringContaining("[seed] Skipping Parent => Child")
    );
  });
});
