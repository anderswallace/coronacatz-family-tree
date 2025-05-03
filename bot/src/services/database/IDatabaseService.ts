//import { Node } from "../../schema/treeNode.js";
import { PrismaClient, Node } from "@prisma/client";

export interface IDatabaseService {
  fetchNodeById(userId: string): Promise<Node>;
  uploadNode(node: Node): Promise<void>;
  removeNode(userId: string): Promise<void>;
}
