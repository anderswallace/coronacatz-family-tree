import { Node } from "../../schema/treeNode.js";

export interface IDatabaseService {
  fetchNodeById(userId: string): Promise<Node>;
  uploadNode(node: Node): Promise<void>;
}
