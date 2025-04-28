import { describe, test, expect, vi } from "vitest";
import { main } from "./main.js";
import { registerSlashCommands } from "./core/registerCommands.js";
import { initFirebase } from "./services/database/firebase.js";

const mockLogin = vi.fn();
const mockOnce = vi.fn();
const mockOn = vi.fn();

vi.mock("./core/registerCommands.js", () => {
  return {
    registerSlashCommands: vi.fn(),
  };
});

vi.mock("./core/events.js", () => {
  return {
    setupEvents: vi.fn(),
  };
});

vi.mock("./services/database/firebase.ts", () => {
  return {
    initFirebase: vi.fn(),
  };
});

vi.mock("./config/config.js", () => ({
  getConfig: vi.fn(() => ({
    discordToken: "mock-token",
    clientId: "mock-client-id",
    targetChannel: "mock-channel",
    firebaseDbUrl: "mock-db-url",
    firebaseProjectId: "mock-project-id",
    firebaseApiKey: "mock-api-key",
  })),
}));

vi.mock("./core/client.js", () => {
  return {
    createClient: () => ({
      login: mockLogin,
      once: mockOnce,
      on: mockOn,
      user: { tag: "Bot#1234" },
    }),
  };
});

describe("index", () => {
  const logSpy = vi.spyOn(console, "log").mockImplementation(() => {});

  test("Should register slash commands and log in ", async () => {
    // simulate ready event
    mockOnce.mockImplementation((event: string, handler: () => void) => {
      if (event === "ready") handler();
    });

    await main();

    expect(initFirebase).toHaveBeenCalledWith(
      "mock-db-url",
      "mock-project-id",
      "mock-api-key",
    );
    expect(registerSlashCommands).toHaveBeenCalledWith(
      "mock-token",
      "mock-client-id",
    );
    expect(logSpy).toHaveBeenCalledWith("Logged in as Bot#1234");
  });
});
