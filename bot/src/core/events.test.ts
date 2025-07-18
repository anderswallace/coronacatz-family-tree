import { describe, test, expect, beforeEach, vi } from "vitest";
import { setupEvents } from "./events.js";
import { Client, Events, Interaction } from "discord.js";
import { setupAddListeners } from "../listeners/addListeners.js";
import { handleHelpCommand } from "../commands/help.js";
import { ServiceContainer } from "../services/index.js";
import { createDiscordChannel } from "../types/discord.js";

vi.mock("../listeners/addListeners", () => ({
  setupAddListeners: vi.fn(),
}));

vi.mock("../commands/help", () => ({
  handleHelpCommand: vi.fn(),
}));

vi.mock("../commands/seed", () => ({
  handleSeedCommand: vi.fn(),
}));

const targetChannel = createDiscordChannel("family-tree");
const mockServicesContainer = {} as unknown as ServiceContainer;

describe("setupEvents", () => {
  let client: Client;

  beforeEach(() => {
    client = new Client({ intents: [] });
    vi.clearAllMocks();
  });

  test("Should call setupAddListeners", () => {
    setupEvents(client, mockServicesContainer, targetChannel);
    expect(setupAddListeners).toHaveBeenCalledWith(
      client,
      mockServicesContainer,
      targetChannel,
    );
  });

  test("Should call handleHelpCommand when interaction is a chat interaction with 'help' in command", () => {
    setupEvents(client, mockServicesContainer, targetChannel);

    const mockInteraction = {
      isChatInputCommand: () => true,
      commandName: "help",
    } as unknown as Interaction;

    client.emit(Events.InteractionCreate, mockInteraction);

    expect(handleHelpCommand).toHaveBeenCalledWith(mockInteraction);
  });

  test("Should not call handleHelpCommand for non-chat interactions", () => {
    setupEvents(client, mockServicesContainer, targetChannel);

    const mockInteraction = {
      isChatInputCommand: () => false,
    } as unknown as Interaction;

    client.emit(Events.InteractionCreate, mockInteraction);

    expect(handleHelpCommand).toHaveBeenCalledTimes(0);
  });

  test("Should not call handleHelpCommand for chat interaction that is not help command", () => {
    setupEvents(client, mockServicesContainer, targetChannel);

    const mockInteraction = {
      isChatInputCommand: () => true,
      commandName: "other",
    } as unknown as Interaction;

    client.emit(Events.InteractionCreate, mockInteraction);

    expect(handleHelpCommand).toHaveBeenCalledTimes(0);
  });
});
