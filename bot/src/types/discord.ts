import { Opaque } from "ts-essentials";

export type DiscordChannel = Opaque<string, "DiscordChannel">;

export function createDiscordChannel(channel: string): DiscordChannel {
  const CHANNEL_REGEX = /^[a-z]+(-[a-z]+)*$/; // only lowercase letters and dashes

  if (!CHANNEL_REGEX.test(channel)) {
    throw new Error(`Invalid Discord channel name ${channel}`);
  }

  return channel as DiscordChannel;
}
