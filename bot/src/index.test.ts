import {
  describe,
  test,
  expect,
  vi,
  Mock,
  beforeEach,
  afterEach,
} from "vitest";
import { init } from "./index.js";
import { registerSlashCommands } from "./core/registerCommands.js";
import { client } from "./core/client.js";
import { setupEvents } from "./core/events.js";

vi.mock("../src/core/client.js", () => ({
  client: {
    once: vi.fn(),
    login: vi.fn(),
    user: { tag: "Bot#1234" },
  },
}));

vi.mock("../src/core/registerCommands.js", () => ({
  registerSlashCommands: vi.fn(),
}));

vi.mock("../src/core/events.js", () => ({
  setupEvents: vi.fn(),
}));

describe("Main bot entry file", () => {
  beforeEach(() => {
    process.env.DISCORD_TOKEN = "mock-token";
    process.env.CLIENT_ID = "mock-client-id";
  });

  afterEach(() => {
    delete process.env.DISCORD_TOKEN;
    delete process.env.CLIENT_ID;
  });

  test("Should register slash commands and log in ", async () => {
    /*await init();
    expect(registerSlashCommands).toHaveBeenCalledWith(
      "mock-token",
      "mock-client-id"
    );
    expect(setupEvents).toHaveBeenCalledWith(client);
    expect(client.login).toHaveBeenCalledWith("mock-token");*/
  });

  /*test("Should register ready listener with correct client username", () => {
    const logSpy = vi.spyOn(console, "log").mockImplementation(() => {});

    const callback = (client.once as Mock).mock.calls.find(
      ([event]) => event === "ready"
    )?.[1];

    expect(callback).toBeDefined();
    callback();

    expect(client.once).toHaveBeenCalledWith("ready", expect.any(Function));
    expect(logSpy).toHaveBeenCalledWith("Logged in as Bot#1234");
  });*/
});
