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

  test("Should find match even when message has improper spacing", () => {
    const mockMessage = "please add    <@1234>   to   <@5432>";

    const parsedIds = parseAddMessage(mockMessage);

    expect(parsedIds).not.toBeNull();
  });

  test("Should find match if user ID has leading exclamation point (user possesses a nickname)", () => {
    const childIdValue = "1234";
    const parentIdValue = "5432";

    const childIdString = `<@!${childIdValue}>`;
    const parentIdString = `<@!${parentIdValue}>`;

    const mockMessage = `please add ${childIdString} to ${parentIdString}`;

    const parsedIds = parseAddMessage(mockMessage);

    expect(parsedIds).toBeDefined();
    expect(parsedIds?.childId).toEqual(childIdValue);
    expect(parsedIds?.parentId).toEqual(parentIdValue);
  });

  test("Should find match if user ID does not have leading exclamation point (user has no nickname)", () => {
    const childIdValue = "1234";
    const parentIdValue = "5432";

    const childIdString = `<@!${childIdValue}>`;
    const parentIdString = `<@!${parentIdValue}>`;

    const mockMessage = `please add ${childIdString} to ${parentIdString}`;

    const parsedIds = parseAddMessage(mockMessage);

    expect(parsedIds).toBeDefined();
    expect(parsedIds?.childId).toEqual(childIdValue);
    expect(parsedIds?.parentId).toEqual(parentIdValue);
  });
});
