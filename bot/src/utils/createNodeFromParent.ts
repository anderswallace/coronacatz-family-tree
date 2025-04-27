import { NodeError, UserNotFoundError } from "../errors/customErrors.js";
import { TreeSchema, Node } from "../schema/treeNode.js";
import { fetchNodeById } from "../services/databaseService.js";
import { Database } from "firebase/database";

export async function createNodeFromParent(
  userId: string,
  name: string,
  parentId: string,
  database: Database
): Promise<Node> {
  const parent = await fetchNodeById(parentId, database);
  if (!parent) {
    throw new UserNotFoundError(parentId);
  }

  // construct new node while inheriting group from parent
  const rawNode: Node = {
    userId,
    name,
    parentId: parent.userId,
    group: parent.group,
    color: parent.color,
  };

  const result = TreeSchema.safeParse(rawNode);

  if (!result.success) {
    const errorMessage = result.error.issues[0].message;
    throw new NodeError(userId, errorMessage);
  }

  return result.data;
}
