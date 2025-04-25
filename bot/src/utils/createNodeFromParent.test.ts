import { describe, test, expect, vi, Mock, afterEach } from "vitest";
import { Database } from "firebase/database";
import { fetchNodeById } from "../services/databaseService.js";
import { createNodeFromParent } from "./createNodeFromParent.js";

vi.mock("../services/databaseService.js", () => ({
  fetchNodeById: vi.fn(),
}));

const mockDb = {} as unknown as Database;

describe("createNodeFromParent", () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  test("Should create new node when there is a valid parent", async () => {
    const mockUserId = "mock-user-id";
    const mockName = "mock-name";
    const mockParentId = "mock-parent-id";
    const mockGroup = "mock-group";
    const mockColor = "#ffffff";

    // Mock valid node being returned from Firebase
    (fetchNodeById as Mock).mockReturnValueOnce({
      userId: mockParentId,
      name: "mock-parent-name",
      parentId: "5678",
      group: mockGroup,
      color: mockColor,
    });

    const data = await createNodeFromParent(
      mockUserId,
      mockName,
      mockParentId,
      mockDb,
    );
    expect(data.userId).toEqual(mockUserId);
    expect(data.name).toEqual(mockName);
    expect(data.parentId).toEqual(mockParentId);
    expect(data.group).toEqual(mockGroup);
    expect(data.color).toEqual(mockColor);
  });

  test("Should throw error when parent is not found", async () => {
    const mockUserId = "mock-user-id";
    const mockName = "mock-name";
    const mockParentId = "mock-parent-id";
    const errorMessage = `Parent with ID ${mockParentId} not found`;

    // Mock fetchNode returning as null to simulate parent not being found
    (fetchNodeById as Mock).mockReturnValueOnce(null);

    await expect(
      createNodeFromParent(mockUserId, mockName, mockParentId, mockDb),
    ).rejects.toThrow(errorMessage);
  });

  test("Should throw error when database data shape does not match schema", async () => {
    // test here
    const mockUserId = "mock-user-id";
    const mockName = "mock-name";
    const mockParentId = "mock-parent-id";
    const mockGroup = "mock-group";
    const mockColor = "#ffff"; // incorrect length color to throw error
    const errorMessage = `Invalid TreeNode: Color must be a hex code`;

    // Mock valid node being returned from Firebase
    (fetchNodeById as Mock).mockReturnValueOnce({
      userId: mockParentId,
      name: "mock-parent-name",
      parentId: "5678",
      group: mockGroup,
      color: mockColor,
    });

    await expect(
      createNodeFromParent(mockUserId, mockName, mockParentId, mockDb),
    ).rejects.toThrow(errorMessage);
  });
});
