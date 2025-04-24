import dotenv from "dotenv";

dotenv.config();

export type Env = Record<string, string | undefined>;

function getEnv(env: Env, key: string): string {
  const value = env[key];
  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
}

export function getConfig(env: Env) {
  return {
    discordToken: getEnv(env, "DISCORD_TOKEN"),
    clientId: getEnv(env, "CLIENT_ID"),
    targetChannel: getEnv(env, "TARGET_CHANNEL"),
    firebaseDbUrl: getEnv(env, "FIREBASE_DB_URL"),
    firebaseProjectId: getEnv(env, "FIREBASE_PROJECT_ID"),
    firebaseApiKey: getEnv(env, "FIREBASE_API_KEY"),
  };
}
