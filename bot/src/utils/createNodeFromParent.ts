import { TreeSchema, Node } from "../schema/treeNode.js";
import { fetchNodeById } from "../services/databaseService.js";
import { Database } from "firebase/database";

export async function createNodeFromParent(
  userId: string,
  name: string,
  parentId: string,
  database: Database,
): Promise<Node> {
  const parent = await fetchNodeById(parentId, database);
  if (!parent) {
    throw new Error(`Parent with ID ${parentId} not found`);
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
    throw new Error(`Invalid TreeNode: ${errorMessage}`);
  }

  return result.data;
}
