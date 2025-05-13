import { ConfigError } from "../errors/customErrors";

function getEnv(key: string): string {
  const value = import.meta.env[key];
  if (!value) {
    throw new ConfigError(key);
  }
  return value;
}

export function getConfig() {
  return {
    supabaseUrl: getEnv("VITE_SUPABASE_URL"),
    supabaseAnonKey: getEnv("VITE_SUPABASE_ANON_KEY"),
  };
}
