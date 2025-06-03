import {
  PrismaOperationError,
  UserAlreadyExistsError,
  UserNotFoundError,
} from "../../errors/customErrors.js";
import { IDatabaseService } from "./IDatabaseService.js";
import { Prisma, PrismaClient, Node } from "@prisma/client";

export class DatabaseService implements IDatabaseService {
  constructor(private prismaClient: PrismaClient) {}

  private async _fetchNodeById(
    client: Prisma.TransactionClient,
    userId: string,
  ) {
    const node = await client.node.findUnique({
      where: { userId },
    });

    if (!node) {
      throw new UserNotFoundError(userId);
    }

    return node;
  }

  // private helper upload function for transactions
  private async _uploadNode(
    tx: Prisma.TransactionClient,
    childId: string,
    parentId: string,
    name: string,
  ) {
    const parent = await this._fetchNodeById(tx, parentId);

    // assign appropriate values from parent and upload
    await tx.node.create({
      data: {
        userId: childId,
        name,
        parentId,
        group: parent.group,
        color: parent.color,
      },
    });
  }

  public async fetchNodeById(userId: string): Promise<Node> {
    return this._fetchNodeById(this.prismaClient, userId);
  }

  // Upload userId to database under parentId, where userId and name belong to user to be uploaded
  public async uploadNode(
    userId: string,
    parentId: string,
    name: string,
  ): Promise<void> {
    // create transaction client for atomicity
    await this.prismaClient
      .$transaction(async (tx) => {
        await this._uploadNode(tx, userId, parentId, name);
      })
      .catch((err) => {
        if (
          err instanceof Prisma.PrismaClientKnownRequestError &&
          err.code === "P2002"
        ) {
          throw new UserAlreadyExistsError(name);
        } else if (err instanceof Error) {
          throw new PrismaOperationError(err.message);
        } else {
          throw new PrismaOperationError("Unknown Prisma Error");
        }
      });
  }

  // Upload a batch of edges all at once, utilizing transaction client for atomicity
  public async uploadNodes(
    edges: { childId: string; parentId: string; name: string }[],
  ): Promise<number> {
    let inserted = 0;

    // create transaction client for all or nothing operation on edges
    await this.prismaClient.$transaction(async (tx) => {
      for (const edge of edges) {
        try {
          await this._uploadNode(tx, edge.childId, edge.parentId, edge.name);
          inserted++;
        } catch (err) {
          // we can continue looping as this does not cause errors in overall data shape
          if (err instanceof UserAlreadyExistsError) {
            continue;

            // any other error, we break out of operation and cancel entire batch
          } else {
            throw err;
          }
        }
      }
    });

    return inserted;
  }

  public async updateNode(userId: string, newName: string): Promise<void> {
    try {
      const user = await this.fetchNodeById(userId);
      const oldName = user.name;

      const operations = [];

      // update name of user to newly assigned name
      operations.push(
        this.prismaClient.node.update({
          where: { userId },
          data: { name: newName },
        }),
      );

      // check if user is a Founder (group and name match), update group name to new name if so
      if (oldName === user.group) {
        operations.push(
          this.prismaClient.node.updateMany({
            where: { group: user.group },
            data: { group: newName },
          }),
        );
      }

      // push all operations as transaction
      await this.prismaClient.$transaction(operations);
    } catch (err) {
      if (err instanceof Error) {
        throw new PrismaOperationError(err.message);
      } else {
        throw new PrismaOperationError("Unknown Error");
      }
    }
  }

  // remove selected userId re-parent all its children to its parent node
  public async removeNode(userId: string): Promise<void> {
    try {
      const user = await this.fetchNodeById(userId);
      const parent = await this.fetchNodeById(user.parentId);

      const operations = [];

      // re-parent all children to parent of node being removed
      operations.push(
        this.prismaClient.node.updateMany({
          where: { parentId: userId },
          data: { parentId: parent.userId },
        }),
      );

      // check if user is the root of the tree (a founder), if so update old group to that of the new parent
      if (user.group === user.name) {
        operations.push(
          this.prismaClient.node.updateMany({
            where: { group: user.group },
            data: { group: parent.group, color: parent.color },
          }),
        );
      }

      // remove node
      operations.push(
        this.prismaClient.node.delete({
          where: { userId },
        }),
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
