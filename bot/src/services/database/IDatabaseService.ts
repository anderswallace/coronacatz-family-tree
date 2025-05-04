import { Node } from "@prisma/client";

export interface IDatabaseService {
  fetchNodeById(userId: string): Promise<Node>;
  uploadNode(
    userId: string,
    parentId: string,
    childName: string,
  ): Promise<void>;
  //removeNode(userId: string): Promise<void>;
}
