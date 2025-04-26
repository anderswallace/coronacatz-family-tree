import { ref, get, update, Database } from "firebase/database";
import { Node, TreeSchema } from "../schema/treeNode.js";

export async function fetchNodeById(
  userId: string,
  database: Database,
): Promise<Node> {
  const snapshot = await get(ref(database, `users/${userId}`));

  if (!snapshot.exists()) {
    throw new Error(`User with ID ${userId} not found in the database`);
  }

  const raw = snapshot.val();
  const result = TreeSchema.safeParse(raw);

  if (!result.success) {
    const errorMessage = result.error.issues[0].message;
    throw new Error(`Invalid Node data for user ${userId}: ${errorMessage}`);
  }

  return result.data;
}

export async function uploadNode(
  node: Node,
  database: Database,
): Promise<void> {
  const result = TreeSchema.safeParse(node);
  if (!result.success) {
    const errorMessage = result.error.issues[0].message;
    throw new Error(`Invalid Node data: ${errorMessage}`);
  }

  const updates: Record<string, unknown> = {
    [`/users/${node.userId}`]: node,
    [`/children/${node.parentId}/${node.userId}`]: true,
  };

  await update(ref(database), updates);
}
