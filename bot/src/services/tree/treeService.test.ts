import { describe, test, expect, vi, Mock, afterEach } from "vitest";
import { NodeError, UserNotFoundError } from "../../errors/customErrors.js";
import { IDatabaseService } from "../database/IDatabaseService.js";
import { TreeService } from "./treeService.js";

const mockDatabaseService = {
  fetchNodeById: vi.fn(),
  uploadNode: vi.fn(),
} as unknown as IDatabaseService;

const mockTreeService = new TreeService(mockDatabaseService);

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
    (mockDatabaseService.fetchNodeById as Mock).mockReturnValueOnce({
      userId: mockParentId,
      name: "mock-parent-name",
      parentId: "5678",
      group: mockGroup,
      color: mockColor,
    });

    const data = await mockTreeService.createNodeFromParent(
      mockUserId,
      mockName,
      mockParentId,
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

    // Mock fetchNode returning as null to simulate parent not being found
    (mockDatabaseService.fetchNodeById as Mock).mockReturnValueOnce(null);

    await expect(
      mockTreeService.createNodeFromParent(mockUserId, mockName, mockParentId),
    ).rejects.toThrow(UserNotFoundError);
  });

  test("Should throw error when database data shape does not match schema", async () => {
    // test here
    const mockUserId = "mock-user-id";
    const mockName = "mock-name";
    const mockParentId = "mock-parent-id";
    const mockGroup = "mock-group";
    const mockColor = "#ffff"; // incorrect length color to throw error

    // Mock valid node being returned from Firebase
    (mockDatabaseService.fetchNodeById as Mock).mockReturnValueOnce({
      userId: mockParentId,
      name: "mock-parent-name",
      parentId: "5678",
      group: mockGroup,
      color: mockColor,
    });

    await expect(
      mockTreeService.createNodeFromParent(mockUserId, mockName, mockParentId),
    ).rejects.toThrow(NodeError);
  });
});
