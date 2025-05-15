import { ConfigError } from "../errors/customErrors";

export type Env = Record<string, string | undefined>;

function getEnv(env: Env, key: string): string {
  const value = env[key];
  if (!value) {
    throw new ConfigError(key);
  }
  return value;
}

export function getConfig(env: Env) {
  return {
    supabaseUrl: getEnv(env, "VITE_SUPABASE_URL"),
    supabaseAnonKey: getEnv(env, "VITE_SUPABASE_ANON_KEY"),
  };
}
