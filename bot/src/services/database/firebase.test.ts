import { describe, expect, test, vi, afterEach, Mock } from "vitest";
import { initFirebase } from "./firebase.js";
import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";

vi.mock("firebase/app", () => ({
  getApps: vi.fn(),
  initializeApp: vi.fn(),
}));

vi.mock("firebase/database", () => ({
  getDatabase: vi.fn(),
}));

describe("firebase", () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  test("Should initialize a firebase app when no app exists yet", () => {
    const mockInitializeApp = initializeApp as Mock;
    const mockGetDatabase = getDatabase as Mock;
    const consoleSpy = vi.spyOn(console, "log").mockImplementation(() => {});

    const mockUrl = "https://mock.firebaseio.com";
    const mockApiKey = "mockKey";
    const mockProjectId = "1234";
    const mockDb = { name: "db" };
    const mockApp = { name: "app" };

    mockInitializeApp.mockReturnValue(mockApp);
    mockGetDatabase.mockReturnValue(mockDb);

    const db = initFirebase(mockUrl, mockProjectId, mockApiKey);

    expect(mockInitializeApp).toHaveBeenCalledWith({
      databaseURL: mockUrl,
      projectId: mockProjectId,
      apiKey: mockApiKey,
    });
    expect(consoleSpy).toHaveBeenCalledWith("Firebase database initialized.");
    expect(db).toBe(mockDb);
  });
});
