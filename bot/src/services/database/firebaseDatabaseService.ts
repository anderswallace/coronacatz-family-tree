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
    };

    const parent = await this.fetchNodeById(node.parentId);
    if (!parent.children.includes(node.userId)) {
      parent.children.push(node.userId);
      updates[`/users/${parent.userId}`] = parent;
    }

    await update(ref(this.database), updates);
  }

  async removeNode(userId: string): Promise<void> {
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
  }
}
