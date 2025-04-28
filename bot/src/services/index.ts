import { Database } from "firebase/database";
import { FirebaseDatabaseService } from "./database/firebaseDatabaseService.js";
import { TreeService } from "./tree/treeService.js";

export interface ServiceContainer {
  databaseService: FirebaseDatabaseService;
  treeService: TreeService;
}

export function buildServices(database: Database): ServiceContainer {
  const databaseService = new FirebaseDatabaseService(database);
  const treeService = new TreeService(databaseService);

  return {
    databaseService,
    treeService,
  };
}
