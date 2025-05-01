import { IDatabaseService } from "../database/IDatabaseService.js";
import { TreeSchema, Node } from "../../schema/treeNode.js";
import { NodeError, UserNotFoundError } from "../../errors/customErrors.js";

export class TreeService {
  constructor(private databaseService: IDatabaseService) {}

  async createNodeFromParent(
    userId: string,
    name: string,
    parentId: string,
  ): Promise<Node> {
    const parent = await this.databaseService.fetchNodeById(parentId);
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
      children: [],
    };

    const result = TreeSchema.safeParse(rawNode);

    if (!result.success) {
      const errorMessage = result.error.issues[0].message;
      throw new NodeError(userId, errorMessage);
    }

    return result.data;
  }
}
