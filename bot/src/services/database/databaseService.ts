import {
  PrismaOperationError,
  UserAlreadyExistsError,
  UserNotFoundError,
} from "../../errors/customErrors.js";
import { IDatabaseService } from "./IDatabaseService.js";
import { Prisma, PrismaClient, Node } from "@prisma/client";
import { tracer } from "../../telemetry/tracing.js";
import { SpanStatusCode } from "@opentelemetry/api";

export class DatabaseService implements IDatabaseService {
  constructor(private prismaClient: PrismaClient) {}

  /**
   * Private method to fetch a Node from the Supabase DB
   *
   * @param client - Prisma Client to interact with Supabase DB
   * @param userId - The Discord User ID of the node to fetch
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
   * @param tx - Prisma TransactionClient to perform DB transaction operation
   * @param childId - User ID of the child node to upload
   * @param parentId - User ID of the parent node of child
   * @param name - Name of the child node
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
   * @param userId - Discord User ID of the node to fetch
   * @returns Node with matching {@link userId}
   */
  public async fetchNodeById(userId: string): Promise<Node> {
    // Root span for fetchNodeById
    return tracer.startActiveSpan(
      "databaseService.fetchNodeById",
      { attributes: { "app.user_id": userId } },
      async (span) => {
        try {
          const node = await this._fetchNodeById(this.prismaClient, userId);

          span.setStatus({ code: SpanStatusCode.OK });
          return node;
        } catch (err) {
          span.recordException(err as Error);
          span.setStatus({
            code: SpanStatusCode.ERROR,
            message: (err as Error).message,
          });
          throw err;
        } finally {
          span.end();
        }
      },
    );
  }

  /**
   * Method to create and upload a new node from {@link userId} and {@link name} to DB
   *
   * New node is inserted into the family tree hierarchy under {@link parentId}
   *
   * @param userId - Discord User ID of node to create and upload
   * @param parentId - User ID of the parent node the child is a descendant of in the family tree
   * @param name - Name of the user to upload
   */
  public async uploadNode(
    userId: string,
    parentId: string,
    name: string,
  ): Promise<void> {
    // Root span for uploadNode
    return tracer.startActiveSpan(
      "databaseService.uploadNode",
      {
        attributes: {
          "app.user_id": userId,
          "app.parent_id": parentId,
          "app.user_name": name,
        },
      },
      async (span) => {
        // create transaction client for atomicity
        await this.prismaClient
          .$transaction(async (tx) => {
            await this._uploadNode(tx, userId, parentId, name);
            span.setStatus({ code: SpanStatusCode.OK });
          })
          .catch((err) => {
            if (
              err instanceof Prisma.PrismaClientKnownRequestError &&
              err.code === "P2002"
            ) {
              const userError = new UserAlreadyExistsError(name);
              span.recordException(userError);
              span.setStatus({
                code: SpanStatusCode.ERROR,
                message: userError.message,
              });
              throw userError;
            } else if (err instanceof Error) {
              const prismaError = new PrismaOperationError(err.message);
              span.recordException(prismaError);
              span.setStatus({
                code: SpanStatusCode.ERROR,
                message: prismaError.message,
              });
              throw prismaError;
            } else {
              const prismaError = new PrismaOperationError(
                "Unknown Prisma Error",
              );
              span.recordException(prismaError);
              span.setStatus({
                code: SpanStatusCode.ERROR,
                message: prismaError.message,
              });
              throw prismaError;
            }
          })
          .finally(() => {
            span.end();
          });
      },
    );
  }

  /**
   * Method to upload a batch of edges at once, utilizing transaction client for atomicity
   *
   * @param edges - Pre-constructed edges to upload
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
   * @param userId - Discord User ID of node to upload
   * @param newName - New name to update to in DB
   */
  public async updateNode(userId: string, newName: string): Promise<void> {
    // Root span for updateNode operation
    return tracer.startActiveSpan(
      "databaseService.updateNode",
      {
        attributes: {
          "app.user_id": userId,
          "app.new_name": newName,
        },
      },
      async (span) => {
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

          // check if user is a Founder
          const isFounder = oldName === user.group;

          // update group name to new name if user is a Founder
          if (isFounder) {
            operations.push(
              this.prismaClient.node.updateMany({
                where: { group: user.group },
                data: { group: newName },
              }),
            );
          }

          // push all operations as transaction
          await this.prismaClient.$transaction(operations);
          span.setStatus({ code: SpanStatusCode.OK });
        } catch (err) {
          if (err instanceof Error) {
            // Log information about failed update transaction
            const prismaError = new PrismaOperationError(err.message);
            span.recordException(prismaError);
            span.setStatus({
              code: SpanStatusCode.ERROR,
              message: prismaError.message,
            });

            throw prismaError;
          } else {
            // Log information about unknown error
            const prismaError = new PrismaOperationError("Unknown Error");
            span.recordException(prismaError);
            span.setStatus({
              code: SpanStatusCode.ERROR,
              message: prismaError.message,
            });

            throw prismaError;
          }
        } finally {
          span.end();
        }
      },
    );
  }

  /**
   * Method to remove Node with ID {@link userId} from DB
   *
   * If Node has children in the DB, the children are re-parented to the Node's parent
   * in a transaction
   *
   * @param userId - Discord User ID of node to remove
   */
  public async removeNode(userId: string): Promise<void> {
    return tracer.startActiveSpan(
      "databaseService.removeNode",
      {
        attributes: {
          "app.user_id": userId,
        },
      },
      async (span) => {
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

          // check if user is the root of the tree (a Founder)
          const isFounder = user.group === user.name;

          // update old group to that of the new parent if user is a Founder
          if (isFounder) {
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
          span.setStatus({ code: SpanStatusCode.OK });
        } catch (err) {
          if (err instanceof Error) {
            const prismaError = new PrismaOperationError(err.message);
            span.recordException(prismaError);
            span.setStatus({
              code: SpanStatusCode.ERROR,
              message: prismaError.message,
            });
            throw prismaError;
          } else {
            const prismaError = new PrismaOperationError(
              "Unknown Prisma Error",
            );
            span.recordException(prismaError);
            span.setStatus({
              code: SpanStatusCode.ERROR,
              message: prismaError.message,
            });
            throw prismaError;
          }
        }
      },
    );
  }
}
