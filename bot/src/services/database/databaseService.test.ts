import { describe, test, expect, vi, Mock, afterEach } from "vitest";
import {
  UserNotFoundError,
  PrismaOperationError,
} from "../../errors/customErrors.js";
import { PrismaClient, Node } from "@prisma/client";
import { DatabaseService } from "./databaseService.js";

const prismaMock = {
  node: {
    findUnique: vi.fn(),
    create: vi.fn(),
  },
} as unknown as PrismaClient;

describe("databaseService", () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  test("fetchNodeById should return valid node when user exists in database", async () => {
    const mockNode: Node = {
      userId: "mock-user",
      name: "mock-name",
      parentId: "mock-parent-id",
      group: "mock-group",
      color: "#ffffff",
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    (prismaMock.node.findUnique as Mock).mockResolvedValue(mockNode);

    const service = new DatabaseService(prismaMock);
    const result = await service.fetchNodeById("mock-user");

    expect(result).toEqual(mockNode);
    expect(prismaMock.node.findUnique).toHaveBeenCalledWith({
      where: { userId: "mock-user" },
    });
  });

  test("fetchNodeById should throw error when user does not exists in database", async () => {
    (prismaMock.node.findUnique as Mock).mockResolvedValue(null);

    const service = new DatabaseService(prismaMock);
    await expect(service.fetchNodeById("mock-user")).rejects.toThrow(
      UserNotFoundError,
    );
  });

  test("uploadNode should upload valid node to database when parent exists", async () => {
    const mockUserId = "mock-user-id";
    const mockParentId = "mock-parent-id";
    const mockName = "mock-name";

    const mockParentNode: Node = {
      userId: mockParentId,
      name: "mock-parent-name",
      parentId: "mock-parent-parent-id",
      group: "mock-group",
      color: "#ffffff",
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    (prismaMock.node.findUnique as Mock).mockResolvedValue(mockParentNode);
    (prismaMock.node.create as Mock).mockResolvedValue({} as Node);

    const service = new DatabaseService(prismaMock);

    await service.uploadNode(mockUserId, mockParentId, mockName);

    expect(prismaMock.node.findUnique).toHaveBeenCalledWith({
      where: { userId: mockParentId },
    });

    expect(prismaMock.node.create).toHaveBeenCalledWith({
      data: {
        userId: mockUserId,
        name: mockName,
        parentId: mockParentId,
        group: mockParentNode.group,
        color: mockParentNode.color,
      },
    });
  });

  test("uploadNode should throw PrismaOperationError if write operation fails", async () => {
    const mockUserId = "mock-user-id";
    const mockParentId = "mock-parent-id";
    const mockName = "mock-name";

    const mockParentNode: Node = {
      userId: mockParentId,
      name: "mock-parent-name",
      parentId: "mock-parent-parent-id",
      group: "mock-group",
      color: "#ffffff",
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    (prismaMock.node.findUnique as Mock).mockResolvedValue(mockParentNode);
    (prismaMock.node.create as Mock).mockRejectedValue(
      new Error("DB Write Operation Failed"),
    );

    const service = new DatabaseService(prismaMock);

    await expect(
      service.uploadNode(mockUserId, mockParentId, mockName),
    ).rejects.toThrow(PrismaOperationError);
  });

  test("uploadNode should throw PrismaOperationError with generic message if unknown failure happens", async () => {
    const mockUserId = "mock-user-id";
    const mockParentId = "mock-parent-id";
    const mockName = "mock-name";

    const mockParentNode: Node = {
      userId: mockParentId,
      name: "mock-parent-name",
      parentId: "mock-parent-parent-id",
      group: "mock-group",
      color: "#ffffff",
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    (prismaMock.node.findUnique as Mock).mockResolvedValue(mockParentNode);
    (prismaMock.node.create as Mock).mockRejectedValue("Unexpected Value");

    const service = new DatabaseService(prismaMock);

    await expect(
      service.uploadNode(mockUserId, mockParentId, mockName),
    ).rejects.toThrow(PrismaOperationError);

    await expect(
      service.uploadNode(mockUserId, mockParentId, mockName),
    ).rejects.toThrow(/Unknown Prisma Error/);
  });

  /*test("removeNode should update database with only two commands when removing user with no children", async () => {
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
  });*/
});
