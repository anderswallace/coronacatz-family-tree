import { describe, expect, test, vi, afterEach, beforeEach } from "vitest";
import { createNodeService } from "./nodeService";
import { SupabaseClient } from "@supabase/supabase-js";

const mockSelect = vi.fn();
const mockFrom = vi.fn();

describe("createNodeService", () => {
  let mockClient: SupabaseClient;

  beforeEach(() => {
    mockFrom.mockImplementation(() => ({
      select: mockSelect,
    }));
    mockClient = { from: mockFrom } as unknown as SupabaseClient;
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  test("fetchAllNodes should return data on successful call", async () => {
    mockSelect.mockResolvedValueOnce({ data: [{ id: 1 }], error: null });

    const service = createNodeService(mockClient);
    const result = await service.fetchAllNodes();

    expect(mockFrom).toHaveBeenCalledWith("nodes");
    expect(mockSelect).toHaveBeenCalledWith("*");
    expect(result).toEqual([{ id: 1 }]);
  });

  test("fetchAllNodes should throw error if API call returns with an error", async () => {
    mockSelect.mockResolvedValueOnce({
      data: null,
      error: { message: "Database Error" },
    });

    const service = createNodeService(mockClient);

    await expect(service.fetchAllNodes()).rejects.toThrow("Database Error");
  });

  test("fetchAllNodes returns empty array when data is null", async () => {
    mockSelect.mockResolvedValueOnce({
      data: null,
      error: null,
    });

    const service = createNodeService(mockClient);
    const result = await service.fetchAllNodes();

    expect(result).toEqual([]);
  });
});
