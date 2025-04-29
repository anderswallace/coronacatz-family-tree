import { ref, get, update, Database } from "firebase/database";
import { Node, TreeSchema } from "../../schema/treeNode.js";
import { UserNotFoundError, NodeError } from "../../errors/customErrors.js";
import { IDatabaseService } from "./IDatabaseService.js";

export class FirebaseDatabaseService implements IDatabaseService {
  constructor(private database: Database) {}

  async fetchNodeById(userId: string): Promise<Node> {
    const snapshot = await get(ref(this.database, `users/${userId}`));

    if (!snapshot.exists()) {
      throw new UserNotFoundError(userId);
    }

    const raw = snapshot.val();
    const result = TreeSchema.safeParse(raw);

    if (!result.success) {
      const errorMessage = result.error.issues[0].message;
      throw new NodeError(userId, errorMessage);
    }

    return result.data;
  }

  async uploadNode(node: Node): Promise<void> {
    const result = TreeSchema.safeParse(node);
    if (!result.success) {
      const errorMessage = result.error.issues[0].message;
      throw new NodeError(node.userId, errorMessage);
    }

    const updates: Record<string, unknown> = {
      [`/users/${node.userId}`]: node,
      [`/children/${node.parentId}/${node.userId}`]: true,
    };

    await update(ref(this.database), updates);
  }

  async removeNode(userId: string): Promise<void> {
    // TODO: Implement remove logic here
  }
}
