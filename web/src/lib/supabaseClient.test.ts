import { describe, test, expect, vi, afterEach, Mock } from "vitest";
import { createSupabaseClient } from "./supabaseClient";
import { createClient } from "@supabase/supabase-js";

vi.mock("../config/config", () => ({
  getConfig: vi.fn(() => ({
    supabaseUrl: "mock-url",
    supabaseAnonKey: "mock-anon-key",
  })),
}));

vi.mock("@supabase/supabase-js", () => {
  return {
    createClient: vi.fn(() => ({ mockedClient: true })),
  };
});

describe("supabaseClient", () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  test("createSupabaseClient should get Supabase credentials and create client", () => {
    const mockCreateClient = createClient as Mock;
    const client = createSupabaseClient();

    expect(mockCreateClient).toHaveBeenCalledWith("mock-url", "mock-anon-key");
    expect(client).toEqual({ mockedClient: true });
  });
});
