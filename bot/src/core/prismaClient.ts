import { PrismaClient } from "@prisma/client";

export function initPrismaClient() {
  return new PrismaClient();
}
