import { initializeApp, getApps, FirebaseApp } from "firebase/app";
import { Database, getDatabase } from "firebase/database";

let app: FirebaseApp | undefined;

export function initFirebase(firebaseDbUrl: string): Database {
  if (!getApps().length) {
    app = initializeApp({
      databaseURL: firebaseDbUrl,
    });
    console.log("Firebase database initialized.");
    return getDatabase(app);
  }

  // Already initialized - use the first app
  return getDatabase();
}
