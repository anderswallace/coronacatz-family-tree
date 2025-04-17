import {
  Client,
  GatewayIntentBits,
  Message,
  TextChannel,
  User,
} from "discord.js";
import { beforeEach, describe, expect, test, vi } from "vitest";
import { setupAddListeners } from "./addListeners.js";
import { onMessageCreate } from "../events/onMessageCreate.js";

vi.mock("../events/onMessageCreate.js", () => ({
  onMessageCreate: vi.fn(),
}));

describe("addListeners", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test("Should call onMessageCreate when client emits messageCreate event", () => {
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
      value: "family-tree",
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

    setupAddListeners(mockClient);

    mockClient.emit("messageCreate", mockMessage);

    expect(onMessageCreate).toHaveBeenCalledWith(mockMessage);
  });
});
