import { describe, test, expect, vi, Mock, afterEach } from "vitest";
import { get, ref, update, Database } from "firebase/database";
import { NodeError, UserNotFoundError } from "../../errors/customErrors.js";
import { FirebaseDatabaseService } from "./firebaseDatabaseService.js";
import { Node } from "../../schema/treeNode.js";

vi.mock("firebase/database", () => ({
  ref: vi.fn(),
  get: vi.fn(),
  update: vi.fn(),
}));

const mockDb = {} as unknown as Database;

describe("databaseService", () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  test("fetchNodeById should return valid node when user exists in database", async () => {
    const mockUserId = "mock-user";
    const mockName = "mock-name";
    const mockParentId = "mock-parent-id";
    const mockGroup = "mock-group";
    const mockColor = "#ffffff";

    const mockSnapshot = {
      exists: vi.fn().mockReturnValue(true),
      val: vi.fn().mockReturnValue({
        userId: mockUserId,
        name: mockName,
        parentId: mockParentId,
        group: mockGroup,
        color: mockColor,
        children: [],
      }),
    };

    // mock valid return from database
    (get as Mock).mockReturnValueOnce(mockSnapshot);

    const mockDatabaseService = new FirebaseDatabaseService(mockDb);

    const node = await mockDatabaseService.fetchNodeById(mockUserId);

    expect(node).toEqual({
      userId: mockUserId,
      name: mockName,
      parentId: mockParentId,
      group: mockGroup,
      color: mockColor,
      children: [],
    });
    expect(ref).toHaveBeenCalledWith(mockDb, `users/${mockUserId}`);
    expect(get).toHaveBeenCalledTimes(1);
    expect(mockSnapshot.exists).toHaveBeenCalledTimes(1);
    expect(mockSnapshot.val).toHaveBeenCalledTimes(1);
  });

  test("fetchNodeById should throw error when user does not exists in database", async () => {
    const mockUserId = "mock-user";

    const mockSnapshot = {
      exists: vi.fn().mockReturnValue(false),
    };

    (get as Mock).mockReturnValueOnce(mockSnapshot);

    const mockDatabaseService = new FirebaseDatabaseService(mockDb);

    await expect(mockDatabaseService.fetchNodeById(mockUserId)).rejects.toThrow(
      UserNotFoundError,
    );
  });

  test("fetchNodeById should throw error when returned data has invalid shape", async () => {
    const mockUserId = "mock-user";
    const mockName = "mock-name";
    const mockParentId = "mock-parent-id";
    const mockGroup = "mock-group";
    const mockColor = "#fffffffff"; // invalid hex code to cause Zod to fail

    const mockSnapshot = {
      exists: vi.fn().mockReturnValue(true),
      val: vi.fn().mockReturnValue({
        userId: mockUserId,
        name: mockName,
        parentId: mockParentId,
        group: mockGroup,
        color: mockColor,
        children: [],
      }),
    };

    // mock valid return from database
    (get as Mock).mockReturnValueOnce(mockSnapshot);

    const mockDatabaseService = new FirebaseDatabaseService(mockDb);

    await expect(mockDatabaseService.fetchNodeById(mockUserId)).rejects.toThrow(
      NodeError,
    );
  });

  test("uploadNode should upload valid node to database", async () => {
    const mockUserId = "mock-user";
    const mockName = "mock-name";
    const mockParentId = "mock-parent-id";
    const mockGroup = "mock-group";
    const mockColor = "#ffffff";

    const mockSnapshot = {
      exists: vi.fn().mockReturnValue(true),
      val: vi.fn().mockReturnValue({
        userId: mockUserId,
        name: mockName,
        parentId: mockParentId,
        group: mockGroup,
        color: mockColor,
        children: [],
      }),
    };

    const mockNode = {
      userId: mockUserId,
      name: mockName,
      parentId: mockParentId,
      group: mockGroup,
      color: mockColor,
      children: [],
    };

    const mockParentNode = {
      userId: "mock-parent-id",
      name: "mock-parent-name",
      parentId: "mock-parent-id",
      group: "mock-group",
      color: "ffffff",
      children: [],
    };

    // mock valid return from database
    (get as Mock).mockReturnValueOnce(mockSnapshot);

    const mockDatabaseService = new FirebaseDatabaseService(mockDb);

    // Mock returning a parent node
    vi.spyOn(mockDatabaseService, "fetchNodeById").mockResolvedValueOnce(
      mockParentNode,
    );

    await mockDatabaseService.uploadNode(mockNode);

    expect(ref).toHaveBeenCalledWith(mockDb);
    expect(update).toHaveBeenCalledTimes(1);

    // capture arguments passed to update
    const [refArg, updatesArg] = (update as Mock).mock.calls[0];

    expect(refArg).toEqual(undefined);

    // assert parent array was updated to include child
    expect(updatesArg).toEqual({
      [`/users/${mockUserId}`]: mockNode,
      [`/users/${mockParentId}`]: {
        ...mockParentNode,
        children: [mockNode.userId],
      },
    });
  });

  test("uploadNode should throw error when data has invalid shape", async () => {
    const mockUserId = "mock-user";
    const mockName = "mock-name";
    const mockParentId = "mock-parent-id";
    const mockGroup = "mock-group";
    const INVALID_HEX_CODE = "#ffff"; // invalid hex code to trigger Zod error

    const mockNode = {
      userId: mockUserId,
      name: mockName,
      parentId: mockParentId,
      group: mockGroup,
      color: INVALID_HEX_CODE,
      children: [],
    };

    const mockDatabaseService = new FirebaseDatabaseService(mockDb);

    await expect(mockDatabaseService.uploadNode(mockNode)).rejects.toThrow(
      NodeError,
    );
  });

  test("removeNode should update database with only two commands when removing user with no children", async () => {
    const mockUser: Node = {
      userId: "mock-user",
      name: "mock-name",
      parentId: "mock-parent-id",
      group: "mock-group",
      color: "mock-color",
      children: [],
    };

    const mockParent: Node = {
      userId: "mock-parent",
      name: "mock-parent-name",
      parentId: "mock-parent-id",
      group: "mock-group",
      color: "mock-color",
      children: ["mock-user"],
    };

    const mockService = new FirebaseDatabaseService(mockDb);

    // mock two return calls as user and parent of user
    vi.spyOn(mockService, "fetchNodeById")
      .mockResolvedValueOnce(mockUser)
      .mockResolvedValueOnce(mockParent);

    await mockService.removeNode(mockUser.userId);

    expect(ref).toHaveBeenCalledWith(mockDb);
    expect(update).toHaveBeenCalledTimes(1);

    // capture arguments passed to update
    const [refArg, updatesArg] = (update as Mock).mock.calls[0];

    expect(refArg).toEqual(undefined);
    expect(Object.keys(updatesArg)).toHaveLength(2);
    expect(updatesArg).toEqual({
      [`/users/${mockParent.userId}`]: {
        ...mockParent,
        children: [],
      },
      [`/users/${mockUser.userId}`]: null,
    });
  });

  test("removeNode should update children's parents when removed node has children", async () => {
    const mockUser: Node = {
      userId: "mock-user",
      name: "mock-name",
      parentId: "mock-parent-id",
      group: "mock-group",
      color: "mock-color",
      children: ["childA", "childB"],
    };

    const childA: Node = {
      userId: "childA",
      name: "child-a",
      parentId: "mock-user",
      group: "mock-group",
      color: "mock-color",
      children: [],
    };

    const childB: Node = {
      userId: "childB",
      name: "child-b",
      parentId: "mock-user",
      group: "mock-group",
      color: "mock-color",
      children: [],
    };

    const mockParent: Node = {
      userId: "mock-parent",
      name: "mock-parent-name",
      parentId: "mock-parent-id",
      group: "mock-group",
      color: "mock-color",
      children: ["mock-user"],
    };

    const mockService = new FirebaseDatabaseService(mockDb);
    vi.spyOn(mockService, "fetchNodeById")
      .mockResolvedValueOnce(mockUser)
      .mockResolvedValueOnce(mockParent)
      .mockResolvedValueOnce(childA)
      .mockResolvedValueOnce(childB);

    await mockService.removeNode(mockUser.userId);

    expect(ref).toHaveBeenCalledWith(mockDb);
    expect(update).toHaveBeenCalledTimes(1);

    // capture arguments passed to update
    const [refArg, updatesArg] = (update as Mock).mock.calls[0];

    expect(refArg).toEqual(undefined);
    expect(updatesArg).toEqual({
      [`/users/${childA.userId}`]: {
        ...childA,
        parentId: mockParent.userId,
      },
      [`/users/${childB.userId}`]: {
        ...childB,
        parentId: mockParent.userId,
      },
      [`/users/${mockParent.userId}`]: {
        ...mockParent,
        children: [childA.userId, childB.userId],
      },
      [`/users/${mockUser.userId}`]: null,
    });
  });
});
