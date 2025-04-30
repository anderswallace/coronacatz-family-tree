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
    const user = await this.fetchNodeById(userId);
    const parentId = user.parentId;

    const childrenSnapshot = await get(
      ref(this.database, `children/${userId}`),
    );

    const updates: Record<string, unknown> = {};

    if (childrenSnapshot.exists()) {
      const childrenIds = Object.keys(childrenSnapshot.val());

      // update each child's parentId and remove from node to be deleted
      for (const childId of childrenIds) {
        updates[`/users/${childId}/parentId`] = parentId;
        updates[`/children/${parentId}/${childId}`] = true;
        updates[`/children/${userId}/`] = null;
      }
    }

    // remove user and their reference from parent's children list
    updates[`/users/${userId}`] = null;
    updates[`/children/${parentId}/${userId}`] = null;

    // apply all updates in one atomic operation
    await update(ref(this.database), updates);
  }
}
