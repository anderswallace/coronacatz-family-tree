import { describe, test, expect, vi, afterEach } from "vitest";
import { registerSlashCommands } from "./registerCommands.js";

const mockPut = vi.fn();
const mockSetToken = vi.fn().mockReturnThis();

vi.mock("discord.js", async () => {
  const original = await import("discord.js");
  return {
    ...original,
    REST: vi.fn().mockImplementation(() => ({
      put: mockPut,
      setToken: mockSetToken,
    })),
    Routes: original.Routes,
  };
});

vi.mock("../commands/help", () => ({
  helpCommand: {
    toJSON: () => ({ name: "help", description: "mock help command" }),
  },
}));

vi.mock("../commands/seed", () => ({
  seedCommand: {
    toJSON: () => ({ name: "seed", description: "mock seed command" }),
  },
}));

describe("registerSlashCommands", () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  test("should call REST.put with correct route and command JSON", async () => {
    const logSpy = vi.spyOn(console, "log").mockImplementation(() => {});
    await registerSlashCommands("mock-token", "mock-client-id");

    expect(logSpy).toHaveBeenCalledWith("Registering slash commands...");
    expect(mockSetToken).toHaveBeenCalledWith("mock-token");
    expect(mockPut).toHaveBeenCalledWith(
      "/applications/mock-client-id/commands",
      {
        body: [
          { name: "help", description: "mock help command" },
          { name: "seed", description: "mock seed command" },
        ],
      }
    );
    expect(logSpy).toHaveBeenCalledWith("Slash commands registered.");
  });

  test("Should log message if REST.put throws an error", async () => {
    const consoleError = vi
      .spyOn(console, "error")
      .mockImplementation(() => {});
    mockPut.mockRejectedValueOnce(new Error("discord.js error"));

    await registerSlashCommands("mock-token", "mock-client-id");

    expect(consoleError).toHaveBeenCalledWith(
      "Failed to register commands: ",
      expect.any(Error)
    );

    consoleError.mockRestore();
  });
});
