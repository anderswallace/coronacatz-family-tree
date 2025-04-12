import { describe, expect, test, vi, beforeEach } from "vitest";
import { setupAddListener } from "./addListener.js";
import {
  User,
  Client,
  Message,
  TextChannel,
  GatewayIntentBits,
} from "discord.js";
import { parseAddMessage } from "../utils/parseAddMessage.js";

vi.mock("../utils/parseAddMessage");
vi.mock("../utils/resolveUsernames");

describe("setupAddListener", () => {
  const mockClient = new Client({
    intents: [
      GatewayIntentBits.Guilds,
      GatewayIntentBits.GuildMessages,
      GatewayIntentBits.MessageContent,
    ],
  });

  // set up listener before each test
  beforeEach(() => {
    vi.clearAllMocks();
    setupAddListener(mockClient);
  });

  test("Should ignore messages from bots", async () => {
    const mockMessage = Object.create(Message.prototype) as Message<true>;
    const channel = Object.create(TextChannel.prototype) as TextChannel;

    Object.defineProperty(mockMessage, "author", {
      value: {
        bot: true,
        id: "bot-id",
        username: "BotUser",
      } as User,
    });

    Object.defineProperty(channel, "name", {
      value: "family-tree",
    });

    Object.defineProperty(mockMessage, "channel", {
      value: channel,
    });

    mockClient.emit("messageCreate", mockMessage);
    expect(parseAddMessage).not.toHaveBeenCalled();
  });
});
