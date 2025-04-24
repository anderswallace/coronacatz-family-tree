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
    console.error("Zod validation failed: ", result.error.format());
    throw new Error(
      `Invalid Node data for user ${userId}: ${result.error.message}`,
    );
  }

  return result.data;
}

export async function uploadNode(
  node: Node,
  database: Database,
): Promise<void> {
  const result = TreeSchema.safeParse(node);
  if (!result.success) {
    throw new Error(`Invalid Node data: ${result.error.message}`);
  }

  const updates: Record<string, unknown> = {
    [`/users/${node.userId}`]: node,
    [`/children/${node.parentId}/${node.userId}`]: true,
  };

  await update(ref(database), updates);
}
