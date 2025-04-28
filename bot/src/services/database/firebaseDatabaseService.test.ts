import { describe, test, expect, vi, Mock, afterEach } from "vitest";
import { get, ref, update, Database } from "firebase/database";
//import { fetchNodeById, uploadNode } from "./firebaseDatabaseService.js";
import { NodeError, UserNotFoundError } from "../../errors/customErrors.js";
import { FirebaseDatabaseService } from "./firebaseDatabaseService.js";

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
    const mockColor = "#ffff"; // invalid hex code to cause Zod to fail

    const mockSnapshot = {
      exists: vi.fn().mockReturnValue(true),
      val: vi.fn().mockReturnValue({
        userId: mockUserId,
        name: mockName,
        parentId: mockParentId,
        group: mockGroup,
        color: mockColor,
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

    const mockNode = {
      userId: mockUserId,
      name: mockName,
      parentId: mockParentId,
      group: mockGroup,
      color: mockColor,
    };

    const mockDatabaseService = new FirebaseDatabaseService(mockDb);

    await mockDatabaseService.uploadNode(mockNode);

    expect(ref).toHaveBeenCalledWith(mockDb);
    expect(update).toHaveBeenCalledTimes(1);

    // capture arguments passed to update
    const [refArg, updatesArg] = (update as Mock).mock.calls[0];

    expect(refArg).toEqual(undefined);
    expect(updatesArg).toEqual({
      [`/users/${mockUserId}`]: mockNode,
      [`/children/${mockParentId}/${mockUserId}`]: true,
    });
  });

  test("uploadNode should throw error when data has invalid shape", async () => {
    const mockUserId = "mock-user";
    const mockName = "mock-name";
    const mockParentId = "mock-parent-id";
    const mockGroup = "mock-group";
    const mockColor = "#ffff"; // invalid hex code to trigger Zod error

    const mockNode = {
      userId: mockUserId,
      name: mockName,
      parentId: mockParentId,
      group: mockGroup,
      color: mockColor,
    };

    const mockDatabaseService = new FirebaseDatabaseService(mockDb);

    await expect(mockDatabaseService.uploadNode(mockNode)).rejects.toThrow(
      NodeError,
    );
  });
});
