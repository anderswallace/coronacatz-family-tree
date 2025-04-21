import {
  Client,
  GatewayIntentBits,
  Message,
  TextChannel,
  User,
} from "discord.js";
import { beforeEach, describe, expect, test, vi } from "vitest";
import { setupAddListeners } from "./addListeners.js";
import { createOnMessageCreate } from "../events/onMessageCreate.js";
import { Database } from "firebase/database";

const mockCreateMessage = vi.fn();

vi.mock("../events/onMessageCreate.js", () => ({
  createOnMessageCreate: vi.fn(() => mockCreateMessage),
}));

const targetChannel = "family-tree";
const mockDb = {} as unknown as Database;

describe("addListeners", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test("Should call createOnMessageCreate when client emits messageCreate event", () => {
    const mockMessage = Object.create(Message.prototype) as Message<true>;
    const channel = Object.create(TextChannel.prototype) as TextChannel;

    // Mock user as a bot
    Object.defineProperty(mockMessage, "author", {
      value: {
        bot: true,
        id: "bot-id",
        username: "BotUser",
      } as User,
    });

    Object.defineProperty(channel, "name", {
      value: targetChannel,
    });

    Object.defineProperty(mockMessage, "channel", {
      value: channel,
    });
    const mockClient = new Client({
      intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
      ],
    });

    setupAddListeners(mockClient, mockDb, targetChannel);

    expect(createOnMessageCreate).toHaveBeenCalledWith(mockDb, targetChannel);
  });

  test("Should call onMessageCreate when message is emitted", () => {
    const mockMessage = Object.create(Message.prototype) as Message<true>;
    const channel = Object.create(TextChannel.prototype) as TextChannel;

    // Mock user as a bot
    Object.defineProperty(mockMessage, "author", {
      value: {
        bot: true,
        id: "bot-id",
        username: "BotUser",
      } as User,
    });

    Object.defineProperty(channel, "name", {
      value: targetChannel,
    });

    Object.defineProperty(mockMessage, "channel", {
      value: channel,
    });
    const mockClient = new Client({
      intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
      ],
    });

    setupAddListeners(mockClient, mockDb, targetChannel);

    mockClient.emit("messageCreate", mockMessage);

    expect(mockCreateMessage).toHaveBeenCalled();
  });
});
