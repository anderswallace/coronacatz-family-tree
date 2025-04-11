import { describe, test, expect, afterEach, vi } from "vitest";
import { parseAddMessage } from "./parseAddMessage.js";

describe("parseAddMessage", () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  test("Should return two user IDs from a valid message", () => {
    const childIDValue = "12345";
    const parentIdValue = "98765";

    const childIdString = `<@${childIDValue}>`;
    const parentIdString = `<@${parentIdValue}>`;

    const mockMessage = `please add ${childIdString} to ${parentIdString}`;

    const parsedIds = parseAddMessage(mockMessage);

    expect(parsedIds).toBeDefined();
    expect(parsedIds?.childId).toEqual(childIDValue);
    expect(parsedIds?.parentId).toEqual(parentIdValue);
  });

  test("Should return null when message doesn't contain two user IDs", () => {
    const mockMessage = "please add <@12345> to the tree";

    const parsedIds = parseAddMessage(mockMessage);

    expect(parsedIds).toBeNull();
  });
});
