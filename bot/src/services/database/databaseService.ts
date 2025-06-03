import {
  PrismaOperationError,
  UserAlreadyExistsError,
  UserNotFoundError,
} from "../../errors/customErrors.js";
import { IDatabaseService } from "./IDatabaseService.js";
import { Prisma, PrismaClient, Node } from "@prisma/client";

export class DatabaseService implements IDatabaseService {
  constructor(private prismaClient: PrismaClient) {}

  /**
   * Private method to fetch a Node from the Supabase DB
   *
   * @param client
   * @param userId
   * @returns Node from DB with matching {@link userId}
   */
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

  /**
   * Private method to create and upload new Node to DB using {@link childId} and {@link name}
   *
   * The new Node inherits group and color from the parent node, and is uploaded in a transaction
   * under {@link parentId} Node
   *
   * @param tx
   * @param childId
   * @param parentId
   * @param name
   */
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

  /**
   * Method to retrieve Node from DB by a Discord User ID
   *
   * @param userId
   * @returns Node with matching {@link userId}
   */
  public async fetchNodeById(userId: string): Promise<Node> {
    return this._fetchNodeById(this.prismaClient, userId);
  }

  /**
   * Method to create and upload a new node from {@link userId} and {@link name} to DB
   *
   * New node is inserted into the family tree hierarchy under {@link parentId}
   *
   * @param userId
   * @param parentId
   * @param name
   */
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

  /**
   * Method to upload a batch of edges at once, utilizing transaction client for atomicity
   *
   * @param edges - Pre-constructed edges to be uploaded
   * @returns Number of nodes inserted successfully into the DB
   */
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

  /**
   * Method to update the name of a Node with ID {@link userId} to {@link newName} in the DB
   *
   * @param userId
   * @param newName
   */
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

  /**
   * Method to remove Node with ID {@link userId} from DB
   *
   * If Node has children in the DB, the children are re-parented to the Node's parent
   * in a transaction
   *
   * @param userId
   */
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
