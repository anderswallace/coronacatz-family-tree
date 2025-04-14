import { describe, test, expect } from "vitest";
import { client } from "./client.js";
import { GatewayIntentBits, IntentsBitField } from "discord.js";

describe("client", () => {
  test("Should be an instance of client with correct intents", () => {
    const expectedIntents = new IntentsBitField([
      GatewayIntentBits.Guilds,
      GatewayIntentBits.GuildMessages,
      GatewayIntentBits.MessageContent,
    ]);

    const actualIntents = new IntentsBitField(client.options.intents);

    expect(actualIntents.bitfield).toBe(expectedIntents.bitfield);
  });
});
