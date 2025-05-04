import { PrismaClient } from "@prisma/client";

export function initPrismaClient() {
  const prisma = new PrismaClient();
  return prisma;
}
