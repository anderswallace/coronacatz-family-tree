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

  // TODO: Reimplement removeNode to use Prisma
  /*async removeNode(userId: string): Promise<void> {
    const user = await this.fetchNodeById(userId);
    const parent = await this.fetchNodeById(user.parentId);
    const children = user.children;

    const updates: Record<string, unknown> = {};

    if (children.length > 0) {
      // update the parent ID of each child
      for (const childId of children) {
        const child = await this.fetchNodeById(childId);
        child.parentId = parent.userId;

        // update parent's children list to include reparented child node
        if (!parent.children.includes(childId)) {
          parent.children.push(childId);
        }

        updates[`/users/${childId}`] = child;
      }
    }

    // remove user to be deleted from parent's children list
    parent.children = parent.children.filter((id) => id !== userId);
    updates[`/users/${parent.userId}`] = parent;

    // delete specified node
    updates[`/users/${userId}`] = null;

    // apply all updates in one atomic operation
    await update(ref(this.database), updates);
  }*/
}
