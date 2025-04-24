import { initializeApp, getApps, FirebaseApp } from "firebase/app";
import { Database, getDatabase } from "firebase/database";

let app: FirebaseApp | undefined;

export function initFirebase(
  dbUrl: string,
  projectId: string,
  apiKey: string,
): Database {
  if (!getApps().length) {
    app = initializeApp({
      databaseURL: dbUrl,
      projectId,
      apiKey,
    });
    console.log("Firebase database initialized.");
    return getDatabase(app);
  }

  // Already initialized - use the first app
  return getDatabase();
}
