import { describe, expect, test, vi, afterEach } from "vitest";
import { getConfig } from "./config.js";
import { ConfigError } from "../errors/customErrors.js";

describe("config", () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  test("getConfig should properly expose environment variables through factory function", () => {
    const env = {
      VITE_SUPABASE_URL: "mock-supabase-url",
      VITE_SUPABASE_ANON_KEY: "mock-supabase-anon-key",
    };

    const config = getConfig(env);

    expect(config.supabaseUrl).toBe("mock-supabase-url");
    expect(config.supabaseAnonKey).toBe("mock-supabase-anon-key");
  });

  test("getConfig should throw configError if .env secrets are missing", () => {
    const env = {};

    expect(() => getConfig(env)).toThrowError(ConfigError);
  });
});
