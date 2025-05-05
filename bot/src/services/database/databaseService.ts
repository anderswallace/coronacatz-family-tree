import {
  PrismaOperationError,
  UserNotFoundError,
} from "../../errors/customErrors.js";
import { IDatabaseService } from "./IDatabaseService.js";
import { PrismaClient, Node } from "@prisma/client";

export class DatabaseService implements IDatabaseService {
  constructor(private prismaClient: PrismaClient) {}

  async fetchNodeById(userId: string): Promise<Node> {
    const node = await this.prismaClient.node.findUnique({
      where: { userId },
    });

    if (!node) {
      throw new UserNotFoundError(userId);
    }

    return node;
  }

  // Upload userId to database under parentId
  async uploadNode(
    userId: string,
    parentId: string,
    name: string,
  ): Promise<void> {
    const parent = await this.fetchNodeById(parentId);

    try {
      await this.prismaClient.node.create({
        data: {
          userId,
          name,
          parentId,
          group: parent.group,
          color: parent.color,
        },
      });
    } catch (err) {
      if (err instanceof Error) {
        throw new PrismaOperationError(err.message);
      } else {
        throw new PrismaOperationError("Unknown Prisma Error");
      }
    }
  }

  // remove selected userId reparent all its children to its parent node
  async removeNode(userId: string): Promise<void> {
    try {
      const user = await this.fetchNodeById(userId);
      const parent = await this.fetchNodeById(user.parentId);

      // fetch children who will be reparented
      const children = await this.prismaClient.node.findMany({
        where: { parentId: userId },
      });

      // reparent all children to parent of node being removed
      for (const child of children) {
        await this.prismaClient.node.update({
          where: { userId: child.userId },
          data: { parentId: parent.userId },
        });
      }

      // remove node
      await this.prismaClient.node.delete({
        where: { userId },
      });
    } catch (err) {
      if (err instanceof Error) {
        throw new PrismaOperationError(err.message);
      } else {
        throw new PrismaOperationError("Unknown Prisma Error");
      }
    }
  }
}
