import { DatabaseService } from "./database/databaseService.js";
import { PrismaClient } from "@prisma/client/extension";

export interface ServiceContainer {
  databaseService: DatabaseService;
}

export function buildServices(prismaClient: PrismaClient): ServiceContainer {
  const databaseService = new DatabaseService(prismaClient);

  return {
    databaseService,
  };
}
