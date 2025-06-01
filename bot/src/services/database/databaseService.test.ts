import { describe, test, expect, vi, Mock, afterEach } from "vitest";
import {
  UserNotFoundError,
  PrismaOperationError,
  UserAlreadyExistsError,
} from "../../errors/customErrors.js";
import { Prisma, PrismaClient, Node } from "@prisma/client";
import { DatabaseService } from "./databaseService.js";
import {
  makeTxMock,
  spyOnUpload,
  stubTransaction,
} from "../../test/testUtils.js";

const prismaMock = {
  node: {
    findUnique: vi.fn(),
    create: vi.fn(),
    findMany: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    updateMany: vi.fn(),
  },
  $transaction: vi.fn(),
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

    // create mock transaction
    const txMock = makeTxMock();
    stubTransaction(prismaMock, txMock);

    (txMock.node.findUnique as Mock).mockResolvedValue(mockParentNode);
    (txMock.node.create as Mock).mockResolvedValue({} as Node);

    const service = new DatabaseService(prismaMock);

    await service.uploadNode(mockUserId, mockParentId, mockName);

    expect(prismaMock.$transaction).toHaveBeenCalledTimes(1);
    expect(txMock.node.findUnique).toHaveBeenCalledWith({
      where: { userId: mockParentId },
    });

    expect(txMock.node.create).toHaveBeenCalledWith({
      data: {
        userId: mockUserId,
        name: mockName,
        parentId: mockParentId,
        group: mockParentNode.group,
        color: mockParentNode.color,
      },
    });
  });

  test("uploadNode should throw UserAlreadyExistsError if user already exists", async () => {
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

    // create prisma-like error for known request error
    const prismaError = Object.setPrototypeOf(
      Object.assign(new Error("Unique constraint failed"), {
        code: "P2002",
        clientVersion: "6.7.0",
        meta: { target: ["userId"] },
      }),
      // make instanceof work
      Prisma.PrismaClientKnownRequestError.prototype,
    );

    const txMock = makeTxMock();
    stubTransaction(prismaMock, txMock);

    (txMock.node.findUnique as Mock).mockResolvedValue(mockParentNode);
    (txMock.node.create as Mock).mockRejectedValue(prismaError);

    const service = new DatabaseService(prismaMock);

    await expect(
      service.uploadNode(mockUserId, mockParentId, mockName),
    ).rejects.toThrow(UserAlreadyExistsError);
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

    const txMock = makeTxMock();
    stubTransaction(prismaMock, txMock);

    (txMock.node.findUnique as Mock).mockResolvedValue(mockParentNode);
    (txMock.node.create as Mock).mockRejectedValue(
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

    const txMock = makeTxMock();
    stubTransaction(prismaMock, txMock);

    (txMock.node.findUnique as Mock).mockResolvedValue(mockParentNode);
    (txMock.node.create as Mock).mockRejectedValue("Unexpected Value");

    const service = new DatabaseService(prismaMock);

    await expect(
      service.uploadNode(mockUserId, mockParentId, mockName),
    ).rejects.toThrow(PrismaOperationError);

    // Regex match to check that generic message is passed to thrown error message
    await expect(
      service.uploadNode(mockUserId, mockParentId, mockName),
    ).rejects.toThrow(/Unknown Prisma Error/);
  });

  test("uploadNodes should upload batch of nodes successfully when there are no errors", async () => {
    const edges = [
      { childId: "c1", parentId: "p", name: "Child-1" },
      { childId: "c2", parentId: "p", name: "Child-2" },
    ];

    const txMock = makeTxMock();
    stubTransaction(prismaMock, txMock);

    const services = new DatabaseService(prismaMock);
    const node = spyOnUpload(services).mockResolvedValue(undefined);

    const count = await services.uploadNodes(edges);

    expect(count).toBe(edges.length);
    expect(prismaMock.$transaction).toHaveBeenCalledTimes(1);
    expect(node).toHaveBeenCalledTimes(2);
    expect(node).toHaveBeenNthCalledWith(
      1,
      expect.anything(), // tx
      "c1",
      "p",
      "Child-1",
    );
  });

  test("uploadNodes should skip already existing users but continue execution", async () => {
    const edges = [
      { childId: "c1", parentId: "p", name: "Child-1" },
      { childId: "c2", parentId: "p", name: "Child-2" },
    ];

    const txMock = makeTxMock();
    stubTransaction(prismaMock, txMock);

    const services = new DatabaseService(prismaMock);
    const node = spyOnUpload(services);

    node
      .mockRejectedValueOnce(new UserAlreadyExistsError("Duplicate User"))
      .mockResolvedValueOnce(undefined);

    const count = await services.uploadNodes(edges);

    expect(count).toBe(1);
    expect(node).toHaveBeenCalledTimes(2);
  });

  test("uploadNodes should throw error when non-UserAlreadyExists error occurs", async () => {
    const edges = [
      { childId: "c1", parentId: "p", name: "Child-1" },
      { childId: "c2", parentId: "p", name: "Child-2" },
    ];

    const txMock = makeTxMock();
    stubTransaction(prismaMock, txMock);

    const services = new DatabaseService(prismaMock);
    const node = spyOnUpload(services);

    node
      .mockResolvedValueOnce(undefined)
      .mockRejectedValueOnce(new Error("Unexpected Error"));

    await expect(services.uploadNodes(edges)).rejects.toThrow(Error);
    expect(prismaMock.$transaction).toHaveBeenCalledTimes(1);
  });

  test("updateNode should call DB with new name successfully (non-Founder)", async () => {
    const service = new DatabaseService(prismaMock);

    const mockUser: Node = {
      userId: "mock-user-1",
      name: "mock-old-name",
      parentId: "mock-user-parent-id",
      group: "mock-group",
      color: "#ffffff",
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    (prismaMock.node.findUnique as Mock).mockResolvedValue(mockUser);
    (prismaMock.node.update as Mock).mockResolvedValue({
      ...mockUser,
      name: "mock-new-name",
    });
    (prismaMock.$transaction as Mock).mockResolvedValue(undefined);

    await service.updateNode(mockUser.userId, "mock-new-name");

    expect(prismaMock.node.update).toHaveBeenCalledTimes(1);
    expect(prismaMock.node.update).toHaveBeenCalledWith({
      where: { userId: mockUser.userId },
      data: { name: "mock-new-name" },
    });
    expect(prismaMock.node.updateMany).not.toHaveBeenCalled();
    const ops = (prismaMock.$transaction as Mock).mock.calls[0][0];
    expect(ops).toHaveLength(1); // only the update promise
  });

  test("updateNode should call DB with new name and update group (Founder)", async () => {
    const service = new DatabaseService(prismaMock);

    const mockUser: Node = {
      userId: "mock-user-1",
      name: "mock-old-name",
      parentId: "mock-user-parent-id",
      group: "mock-old-name", // group matches name (this node is a founder)
      color: "#ffffff",
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    (prismaMock.node.findUnique as Mock).mockResolvedValue(mockUser);
    (prismaMock.node.update as Mock).mockResolvedValue({
      ...mockUser,
      name: "mock-new-name",
    });
    (prismaMock.node.updateMany as Mock).mockResolvedValue({ count: 3 });
    (prismaMock.$transaction as Mock).mockResolvedValue(undefined);

    await service.updateNode(mockUser.userId, "mock-new-name");

    expect(prismaMock.node.update).toHaveBeenCalledTimes(1);
    expect(prismaMock.node.updateMany).toHaveBeenCalledTimes(1);
    expect(prismaMock.node.update).toHaveBeenCalledWith({
      where: { userId: mockUser.userId },
      data: { name: "mock-new-name" },
    });
    const ops = (prismaMock.$transaction as Mock).mock.calls[0][0];
    expect(ops).toHaveLength(2); // update + updateMany
  });

  test("updateNode should handle errors", async () => {
    const service = new DatabaseService(prismaMock);

    const mockUser: Node = {
      userId: "mock-user-1",
      name: "mock-old-name",
      parentId: "mock-user-parent-id",
      group: "mock-old-name",
      color: "#ffffff",
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    (prismaMock.node.findUnique as Mock).mockResolvedValue(mockUser);

    // Make the transaction fail
    (prismaMock.$transaction as Mock).mockRejectedValue(
      new Error("Some Prisma Error"),
    );

    await expect(
      service.updateNode(mockUser.userId, "mock-new-name"),
    ).rejects.toThrow(PrismaOperationError);
  });

  test("updateNode should handle unknown errors", async () => {
    const service = new DatabaseService(prismaMock);

    const mockUser: Node = {
      userId: "mock-user-1",
      name: "mock-old-name",
      parentId: "mock-user-parent-id",
      group: "mock-old-name",
      color: "#ffffff",
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    (prismaMock.node.findUnique as Mock).mockResolvedValue(mockUser);

    // Make the transaction fail
    (prismaMock.$transaction as Mock).mockRejectedValue("Unexpected value");

    await expect(
      service.updateNode(mockUser.userId, "mock-new-name"),
    ).rejects.toThrow(/unknown error/i);
  });

  test("removeNode should remove selected userId from database", async () => {
    const mockUser: Node = {
      userId: "mock-user-id",
      name: "mock-user-name",
      parentId: "mock-user-parent-id",
      group: "mock-group",
      color: "#ffffff",
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const mockParent: Node = {
      userId: "mock-parent-id",
      name: "mock-parent-name",
      parentId: "mock-parent-parent-id",
      group: "mock-group",
      color: "#ffffff",
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const mockChildren: Node[] = [];

    // revert mock implementation of transaction for batch style that removeNode has
    (prismaMock as any).$transaction = vi.fn(async (ops: any[]) =>
      Promise.all(ops),
    );
    // mock findMany to return no children
    (prismaMock.node.findMany as Mock).mockResolvedValue(mockChildren);

    const deleteSpy = vi.spyOn(prismaMock.node, "delete");
    (deleteSpy as Mock).mockResolvedValue(undefined);

    const service = new DatabaseService(prismaMock);

    // spy on fetchNodeById to mock valid return values
    const fetchNodeSpy = vi
      .spyOn(service, "fetchNodeById")
      .mockImplementationOnce(async () => mockUser)
      .mockImplementationOnce(async () => mockParent);

    await service.removeNode(mockUser.userId);

    expect(fetchNodeSpy).toHaveBeenCalledTimes(2);
    expect(prismaMock.node.updateMany).toHaveBeenCalledTimes(1);
    expect(prismaMock.$transaction).toHaveBeenCalledTimes(1);
    expect(deleteSpy).toHaveBeenCalledWith({
      where: { userId: mockUser.userId },
    });
  });

  test("removeNode should remove selected userId and re-parent its children", async () => {
    const mockUser: Node = {
      userId: "mock-user-id",
      name: "mock-user-name",
      parentId: "mock-user-parent-id",
      group: "mock-group",
      color: "#ffffff",
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const mockParent: Node = {
      userId: "mock-parent-id",
      name: "mock-parent-name",
      parentId: "mock-parent-parent-id",
      group: "mock-group",
      color: "#ffffff",
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // mock children belonging to node being removed
    const mockChildren: Node[] = [
      {
        userId: "mock-grandchild-id",
        name: "mock-grandchild-name",
        parentId: mockUser.userId,
        group: "mock-group",
        color: "#ffffff",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    (prismaMock.node.findMany as Mock).mockResolvedValue(mockChildren);

    const service = new DatabaseService(prismaMock);

    // spy on fetchNodeById to mock valid return values
    const fetchNodeSpy = vi
      .spyOn(service, "fetchNodeById")
      .mockImplementationOnce(async () => mockUser)
      .mockImplementationOnce(async () => mockParent);

    await service.removeNode(mockUser.userId);

    expect(fetchNodeSpy).toHaveBeenCalledTimes(2);
    expect(prismaMock.$transaction).toHaveBeenCalledTimes(1);
    expect(prismaMock.node.updateMany).toHaveBeenCalledTimes(1);
    expect(prismaMock.node.updateMany).toHaveBeenCalledWith({
      where: { parentId: mockUser.userId },
      data: { parentId: mockParent.userId },
    });
    expect(prismaMock.node.delete).toHaveBeenCalledWith({
      where: { userId: mockUser.userId },
    });
  });

  test("removeNode should update group of all children if node being removed is the root", async () => {
    const mockUser: Node = {
      userId: "mock-user-id",
      name: "mock-user-name",
      parentId: "mock-user-parent-id",
      group: "mock-user-name",
      color: "#ffffff",
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const mockParent: Node = {
      userId: "mock-parent-id",
      name: "mock-parent-name",
      parentId: "mock-parent-parent-id",
      group: "mock-parent-name",
      color: "#ffffff",
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // mock children belonging to node being removed
    const mockChildren: Node[] = [
      {
        userId: "mock-grandchild-id",
        name: "mock-grandchild-name",
        parentId: mockUser.userId,
        group: "mock-group",
        color: "#ffffff",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    (prismaMock.node.findMany as Mock).mockResolvedValue(mockChildren);

    const service = new DatabaseService(prismaMock);

    // spy on fetchNodeById to mock valid return values
    const fetchNodeSpy = vi
      .spyOn(service, "fetchNodeById")
      .mockImplementationOnce(async () => mockUser)
      .mockImplementationOnce(async () => mockParent);

    await service.removeNode(mockUser.userId);

    expect(fetchNodeSpy).toHaveBeenCalledTimes(2);
    expect(prismaMock.$transaction).toHaveBeenCalledTimes(1);

    expect(prismaMock.node.updateMany).toHaveBeenCalledTimes(2);
    expect(prismaMock.node.updateMany).toHaveBeenCalledWith({
      where: { parentId: mockUser.userId },
      data: { parentId: mockParent.userId },
    });
    expect(prismaMock.node.updateMany).toHaveBeenCalledWith({
      where: { group: mockUser.group },
      data: { group: mockParent.group, color: mockParent.color },
    });
    expect(prismaMock.node.delete).toHaveBeenCalledWith({
      where: { userId: mockUser.userId },
    });
  });

  test("removeNode should throw PrismaOperationError if a database operation fails", async () => {
    const mockUser: Node = {
      userId: "mock-user-id",
      name: "mock-user-name",
      parentId: "mock-user-parent-id",
      group: "mock-group",
      color: "#ffffff",
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const mockParent: Node = {
      userId: "mock-parent-id",
      name: "mock-parent-name",
      parentId: "mock-parent-parent-id",
      group: "mock-group",
      color: "#ffffff",
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // mock user to contain no children nodes
    const mockChildren: Node[] = [];

    (prismaMock.node.findMany as Mock).mockResolvedValue(mockChildren);
    (prismaMock.$transaction as Mock).mockRejectedValue(
      new Error("Update operation failed"),
    );

    const service = new DatabaseService(prismaMock);

    // spy on fetchNodeById to mock valid return values
    vi.spyOn(service, "fetchNodeById")
      .mockImplementationOnce(async () => mockUser)
      .mockImplementationOnce(async () => mockParent);

    await expect(service.removeNode(mockUser.userId)).rejects.toThrow(
      PrismaOperationError,
    );
  });

  test("removeNode should throw PrismaOperationError with generic message if unknown error occurs", async () => {
    const mockUser: Node = {
      userId: "mock-user-id",
      name: "mock-user-name",
      parentId: "mock-user-parent-id",
      group: "mock-group",
      color: "#ffffff",
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const mockParent: Node = {
      userId: "mock-parent-id",
      name: "mock-parent-name",
      parentId: "mock-parent-parent-id",
      group: "mock-group",
      color: "#ffffff",
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // mock children belonging to node being removed
    const mockChildren: Node[] = [
      {
        userId: "mock-grandchild-id",
        name: "mock-grandchild-name",
        parentId: mockUser.userId,
        group: "mock-group",
        color: "#ffffff",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    (prismaMock.node.findMany as Mock).mockResolvedValue(mockChildren);
    (prismaMock.$transaction as Mock).mockRejectedValue("Unexpected value");

    const service = new DatabaseService(prismaMock);

    // spy on fetchNodeById to mock valid return values
    vi.spyOn(service, "fetchNodeById")
      .mockImplementationOnce(async () => mockUser)
      .mockImplementationOnce(async () => mockParent);

    await expect(service.removeNode(mockUser.userId)).rejects.toThrow(
      /Unknown Prisma Error/,
    );
  });
});
