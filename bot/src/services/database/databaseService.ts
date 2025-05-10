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
    name: string
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

  // remove selected userId re-parent all its children to its parent node
  async removeNode(userId: string): Promise<void> {
    try {
      const user = await this.fetchNodeById(userId);
      const parent = await this.fetchNodeById(user.parentId);

      // fetch children who will be re-parented
      const children = await this.prismaClient.node.findMany({
        where: { parentId: userId },
      });

      const operations = [];

      // re-parent all children to parent of node being removed
      operations.push(
        this.prismaClient.node.updateMany({
          where: { parentId: userId },
          data: { parentId: parent.userId },
        })
      );

      // check if user is the root of the tree (a founder), if so update old group to that of the new parent
      if (user.group === user.name) {
        operations.push(
          this.prismaClient.node.updateMany({
            where: { group: user.group },
            data: { group: parent.group, color: parent.color },
          })
        );
      }

      // remove node
      operations.push(
        this.prismaClient.node.delete({
          where: { userId },
        })
      );

      // execute all updates atomically
      await this.prismaClient.$transaction(operations);
    } catch (err) {
      if (err instanceof Error) {
        throw new PrismaOperationError(err.message);
      } else {
        throw new PrismaOperationError("Unknown Prisma Error");
      }
    }
  }
}
