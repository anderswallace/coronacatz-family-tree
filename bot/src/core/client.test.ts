import { describe, test, expect } from "vitest";
import { createClient } from "./client.js";
import { Client, GatewayIntentBits, IntentsBitField } from "discord.js";

describe("client", () => {
  test("Should be an instance of client with correct intents", () => {
    const client = createClient();

    expect(client).toBeInstanceOf(Client);

    const expectedIntents = new IntentsBitField([
      GatewayIntentBits.Guilds,
      GatewayIntentBits.GuildMessages,
      GatewayIntentBits.MessageContent,
    ]);

    expect(client.options.intents).toEqual(expectedIntents);
  });
});
