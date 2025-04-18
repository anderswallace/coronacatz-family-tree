import { describe, test, expect, beforeEach, vi } from "vitest";
import { setupEvents } from "./events.js";
import { Client, Events, Interaction } from "discord.js";
import { setupAddListeners } from "../listeners/addListeners.js";
import { handleHelpCommand } from "../commands/help.js";

vi.mock("../listeners/addListeners", () => ({
  setupAddListeners: vi.fn(),
}));

vi.mock("../commands/help", () => ({
  handleHelpCommand: vi.fn(),
}));

const targetChannel = "family-tree";

describe("setupEvents", () => {
  let client: Client;

  beforeEach(() => {
    client = new Client({ intents: [] });
    vi.clearAllMocks();
  });

  test("Should call setupAddListeners", () => {
    setupEvents(client, targetChannel);
    expect(setupAddListeners).toHaveBeenCalledWith(client, targetChannel);
  });

  test("Should call handleHelpCommand when interaction is a chat interaction with 'help' in command", () => {
    setupEvents(client, targetChannel);

    const mockInteraction = {
      isChatInputCommand: () => true,
      commandName: "help",
    } as unknown as Interaction;

    client.emit(Events.InteractionCreate, mockInteraction);

    expect(handleHelpCommand).toHaveBeenCalledWith(mockInteraction);
  });

  test("Should not call handleHelpCommand for non-chat interactions", () => {
    setupEvents(client, targetChannel);

    const mockInteraction = {
      isChatInputCommand: () => false,
    } as unknown as Interaction;

    client.emit(Events.InteractionCreate, mockInteraction);

    expect(handleHelpCommand).toHaveBeenCalledTimes(0);
  });
});
