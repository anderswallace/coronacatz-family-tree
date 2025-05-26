import { vi } from "vitest";
import type { PrismaClient, Prisma } from "@prisma/client";

// Fabricates a tx object with its own node mocks
export function makeTxMock() {
  return {
    node: {
      findUnique: vi.fn(),
      create: vi.fn(),
    },
  } satisfies Record<string, any>; // helps TS inference
}

// Stubs prisma.$transaction so the callback gets our txMock
export function stubTransaction(prismaMock: PrismaClient, txMock: any) {
  prismaMock.$transaction = vi.fn(async (cb: any) => {
    return cb(txMock);
  });
}
