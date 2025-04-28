import { initializeApp } from "firebase/app";
import { Database, getDatabase } from "firebase/database";

export function initFirebase(
  dbUrl: string,
  projectId: string,
  apiKey: string
): Database {
  const app = initializeApp({
    databaseURL: dbUrl,
    projectId,
    apiKey,
  });
  console.log("Firebase database initialized.");
  return getDatabase(app);
}
