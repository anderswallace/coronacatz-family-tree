import { describe, expect, test, vi, beforeEach, Mock } from "vitest";
import { User, Message, TextChannel } from "discord.js";
import * as parser from "../utils/parseAddMessage.js";
import * as resolver from "../utils/resolveUsernames.js";
import { createOnMessageCreate } from "./onMessageCreate.js";
import { ServiceContainer } from "../services/index.js";
import { createDiscordChannel, DiscordChannel } from "../types/discord.js";

vi.mock("../utils/resolveUsernames");

const targetChannel: DiscordChannel = createDiscordChannel("family-tree");

const mockServices = {
  databaseService: {
    uploadNode: vi.fn(),
  },
} as unknown as ServiceContainer;

describe("onMessageCreate", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test("Should ignore messages from bots", async () => {
    const parserSpy = vi.spyOn(parser, "parseAddMessage");
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

    const onMessageCreate = createOnMessageCreate(mockServices, targetChannel);

    onMessageCreate(mockMessage);
    expect(parserSpy).not.toHaveBeenCalled();
  });

  test("Should ignore messages not in 'family-tree' channel", async () => {
    const parserSpy = vi.spyOn(parser, "parseAddMessage");
    const mockMessage = Object.create(Message.prototype) as Message<true>;
    const channel = Object.create(TextChannel.prototype) as TextChannel;

    Object.defineProperty(mockMessage, "author", {
      value: {
        bot: false,
        id: "bot-id",
        username: "validUser",
      } as User,
    });

    // Mock the channel being sent is as 'general' and not 'family-tree'
    Object.defineProperty(channel, "name", {
      value: "general",
    });

    Object.defineProperty(mockMessage, "channel", {
      value: channel,
    });

    const onMessageCreate = createOnMessageCreate(mockServices, targetChannel);

    onMessageCreate(mockMessage);
    expect(parserSpy).not.toHaveBeenCalled();
  });

  test("Should stop execution when invalid message structure passed to bot", async () => {
    const resolverSpy = vi.spyOn(resolver, "resolveUsernames");
    const mockMessage = Object.create(Message.prototype) as Message<true>;
    const channel = Object.create(TextChannel.prototype) as TextChannel;

    Object.defineProperty(mockMessage, "author", {
      value: {
        bot: false,
        id: "bot-id",
        username: "validUser",
      } as User,
    });

    // Mock invalid message being sent
    Object.defineProperty(mockMessage, "content", {
      value: "add <@12345> to my tree",
    });

    Object.defineProperty(channel, "name", {
      value: targetChannel,
    });

    Object.defineProperty(mockMessage, "channel", {
      value: channel,
    });

    const onMessageCreate = createOnMessageCreate(mockServices, targetChannel);

    onMessageCreate(mockMessage);
    expect(resolverSpy).not.toHaveBeenCalled();
  });

  test("Should call channel.send with error message when usernames are not resolved", async () => {
    vi.spyOn(resolver, "resolveUsernames").mockResolvedValue(null);
    const mockMessage = Object.create(Message.prototype) as Message<true>;
    const channel = Object.create(TextChannel.prototype) as TextChannel;

    Object.defineProperty(mockMessage, "author", {
      value: {
        bot: false,
        id: "bot-id",
        username: "validUser",
      } as User,
    });

    Object.defineProperty(mockMessage, "content", {
      value: "add <@12345> to <@9876>",
    });

    Object.defineProperty(channel, "name", {
      value: targetChannel,
    });

    Object.defineProperty(mockMessage, "channel", {
      value: channel,
    });

    // Mock methods on channel and message
    const sendMock = vi.fn();
    channel.send = sendMock;

    const onMessageCreate = createOnMessageCreate(mockServices, targetChannel);

    onMessageCreate(mockMessage);

    // Allow async listener to resolve
    await new Promise((r) => setTimeout(r, 0));

    expect(sendMock).toHaveBeenCalledWith(
      "One or more users couldn't be found. Please try again",
    );
  });

  test("Should call channel.send with updated usernames on valid message", async () => {
    const mockChildNickname = "childNickname";
    const mockParentNickname = "parentNickname";
    vi.spyOn(resolver, "resolveUsernames").mockResolvedValue({
      childUsername: mockChildNickname,
      parentUsername: mockParentNickname,
    });

    const mockMessage = Object.create(Message.prototype) as Message<true>;
    const channel = Object.create(TextChannel.prototype) as TextChannel;

    (mockServices.databaseService.uploadNode as Mock).mockResolvedValue(
      undefined,
    );

    Object.defineProperty(mockMessage, "author", {
      value: {
        bot: false,
        id: "bot-id",
        username: "validUser",
      } as User,
    });

    Object.defineProperty(mockMessage, "content", {
      value: "add <@12345> to <@9876>",
    });

    Object.defineProperty(channel, "name", {
      value: targetChannel,
    });

    Object.defineProperty(mockMessage, "channel", {
      value: channel,
    });

    const sendMock = vi.fn();
    channel.send = sendMock;

    const onMessageCreate = createOnMessageCreate(mockServices, targetChannel);

    onMessageCreate(mockMessage);

    // Allow async listener to resolve
    await new Promise((r) => setTimeout(r, 0));

    expect(sendMock).toHaveBeenCalledWith(
      `Family tree updated! Added ${mockChildNickname} to ${mockParentNickname}`,
    );
  });

  test("Should call channel.send with handled error when API fails", async () => {
    vi.spyOn(resolver, "resolveUsernames").mockRejectedValueOnce(
      new Error("Unknown User"),
    );
    const mockMessage = Object.create(Message.prototype) as Message<true>;
    const channel = Object.create(TextChannel.prototype) as TextChannel;

    Object.defineProperty(mockMessage, "author", {
      value: {
        bot: false,
        id: "bot-id",
        username: "validUser",
      } as User,
    });

    Object.defineProperty(mockMessage, "content", {
      value: "add <@12345> to <@9876>",
    });

    Object.defineProperty(channel, "name", {
      value: targetChannel,
    });

    Object.defineProperty(mockMessage, "channel", {
      value: channel,
    });

    const sendMock = vi.fn();
    channel.send = sendMock;

    const onMessageCreate = createOnMessageCreate(mockServices, targetChannel);

    onMessageCreate(mockMessage);

    // Allow async listener to resolve
    await new Promise((r) => setTimeout(r, 0));

    expect(sendMock.mock.calls[0][0].toLowerCase()).toContain("unknown user");
  });

  test("Should handle non-errors thrown by sending 'Unknown error' to channel", async () => {
    vi.spyOn(resolver, "resolveUsernames").mockImplementation(() => {
      throw { message: "DiscordAPI Error", code: 403 };
    });
    const mockMessage = Object.create(Message.prototype) as Message<true>;
    const channel = Object.create(TextChannel.prototype) as TextChannel;

    Object.defineProperty(mockMessage, "author", {
      value: {
        bot: false,
        id: "bot-id",
        username: "validUser",
      } as User,
    });

    Object.defineProperty(mockMessage, "content", {
      value: "add <@12345> to <@9876>",
    });

    Object.defineProperty(channel, "name", {
      value: targetChannel,
    });

    Object.defineProperty(mockMessage, "channel", {
      value: channel,
    });

    const sendMock = vi.fn();
    channel.send = sendMock;

    const onMessageCreate = createOnMessageCreate(mockServices, targetChannel);

    onMessageCreate(mockMessage);

    // Allow async listener to resolve
    await new Promise((r) => setTimeout(r, 0));

    expect(sendMock).toHaveBeenCalledWith("Unknown error.");
  });
});
