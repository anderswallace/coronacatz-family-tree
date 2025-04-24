import { ref, get, update, Database } from "firebase/database";
import { Node, TreeSchema } from "../schema/treeNode.js";

export async function fetchNodeById(
  userId: string,
  database: Database,
): Promise<Node | null> {
  const snapshot = await get(ref(database, `users/${userId}`));

  if (!snapshot.exists()) {
    return null;
  }

  const raw = snapshot.val();
  const result = TreeSchema.safeParse({ userId, ...raw });

  return result.success ? result.data : null;
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
